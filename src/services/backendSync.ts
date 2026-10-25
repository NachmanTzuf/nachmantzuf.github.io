/**
 * Cloud Synchronization and Offline Mutation Queue Service
 * Integrates Supabase PostgreSQL with Row Level Security (RLS), Realtime channels,
 * and optimistic local updates with resilient retry queues.
 */

declare const require: any;
import { storage } from '../storage/userProfileStore';
import type { StorageAdapter } from '../storage/userProfileStore';

let createClient: any = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch {
  createClient = null;
}

export type SupabaseClient = any;
export type RealtimeChannel = any;

// Environment fallback configuration
const SUPABASE_CONFIG = {
  DEFAULT_URL: 'https://placeholder-project.supabase.co',
  DEFAULT_ANON_KEY: 'placeholder-anon-key',
  QUEUE_STORAGE_KEY: 'offline_mutation_queue_v1',
  MAX_RETRIES: 5,
};

export type MutationType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface QueuedMutation<T = Record<string, unknown>> {
  id: string;
  table: string;
  type: MutationType;
  payload: T;
  filterCriteria?: { column: string; value: string | number };
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncTimestamp: number | null;
}

export class BackendSyncManager {
  private client: SupabaseClient | null = null;
  private inFlightProcessPromise: Promise<{ processed: number; succeeded: number; failed: number }> | null = null;
  private lastSyncTimestamp: number | null = null;
  private activeSubscriptions = new Map<string, RealtimeChannel>();
  private storageAdapter: StorageAdapter;

  constructor(storageAdapter?: StorageAdapter, client?: SupabaseClient | null) {
    this.storageAdapter = storageAdapter || storage;
    this.client = client || null;
    if (!this.client && createClient) {
      this.initializeClient();
    }
  }

  /**
   * Initializes or updates Supabase client credentials with RLS header support.
   */
  public initializeClient(url?: string, anonKey?: string): SupabaseClient {
    const targetUrl =
      url ||
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_URL) ||
      SUPABASE_CONFIG.DEFAULT_URL;
    const targetKey =
      anonKey ||
      (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SUPABASE_ANON_KEY) ||
      SUPABASE_CONFIG.DEFAULT_ANON_KEY;

    this.client = createClient(targetUrl, targetKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    return this.client;
  }

  public getClient(): SupabaseClient {
    if (!this.client) {
      return this.initializeClient();
    }
    return this.client;
  }

  /**
   * Retrieves offline mutation queue from persistent storage.
   */
  public getMutationQueue(): QueuedMutation[] {
    const raw = this.storageAdapter.getString(SUPABASE_CONFIG.QUEUE_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as QueuedMutation[];
    } catch {
      return [];
    }
  }

  private saveMutationQueue(queue: QueuedMutation[]): void {
    this.storageAdapter.set(SUPABASE_CONFIG.QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  /**
   * Enqueues a mutation locally, executes optimistic UI update, and triggers background sync.
   */
  public async enqueueMutation<T extends Record<string, unknown>>(
    table: string,
    type: MutationType,
    payload: T,
    filterCriteria?: { column: string; value: string | number },
    optimisticCallback?: () => void
  ): Promise<string> {
    // 1. Durability and operation-specific validation BEFORE optimistic updates
    if (!this.storageAdapter.isPersistent) {
      throw new Error(
        `[BackendSync] Cannot enqueue offline mutation '${type}' on '${table}': durable storage is not available.`
      );
    }

    if ((type === 'UPDATE' || type === 'DELETE') && (!filterCriteria || !filterCriteria.column)) {
      throw new Error(
        `[BackendSync] Mutation '${type}' on '${table}' requires valid filterCriteria with column and value.`
      );
    }

    // 2. Apply optimistic local mutation only after durability and validation checks pass
    if (optimisticCallback) {
      try {
        optimisticCallback();
      } catch (err) {
        console.warn('Optimistic local callback failed:', err);
      }
    }

    // 3. Persist mutation to offline queue
    const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newMutation: QueuedMutation<T> = {
      id: mutationId,
      table,
      type,
      payload,
      filterCriteria,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    const queue = this.getMutationQueue();
    queue.push(newMutation as QueuedMutation);
    this.saveMutationQueue(queue);

    // 4. Attempt instantaneous sync in background
    this.processQueue().catch(() => {});

    return mutationId;
  }

  /**
   * Processes all pending mutations against the Supabase backend with retry limits.
   */
  public async processQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.inFlightProcessPromise) {
      return this.inFlightProcessPromise;
    }

    this.inFlightProcessPromise = (async () => {
      let queue = this.getMutationQueue();
      let succeeded = 0;
      let failed = 0;

      const succeededIds: string[] = [];
      const updatedItems = new Map<string, QueuedMutation>();

      for (const item of queue) {
        if (item.retryCount >= SUPABASE_CONFIG.MAX_RETRIES) {
          // Exceeded retries, mark as permanently failed
          updatedItems.set(item.id, { ...item, status: 'failed' });
          failed++;
          continue;
        }

        try {
          const client = this.getClient();
          let error: unknown = null;

          if (item.type === 'INSERT') {
            const res = await client.from(item.table).insert(item.payload);
            error = res.error;
          } else if (item.type === 'UPDATE') {
            if (!item.filterCriteria || !item.filterCriteria.column) {
              throw new Error(`[BackendSync] UPDATE requires valid filterCriteria`);
            }
            const res = await client
              .from(item.table)
              .update(item.payload)
              .eq(item.filterCriteria.column, item.filterCriteria.value);
            error = res.error;
          } else if (item.type === 'DELETE') {
            if (!item.filterCriteria || !item.filterCriteria.column) {
              throw new Error(`[BackendSync] DELETE requires valid filterCriteria`);
            }
            const res = await client
              .from(item.table)
              .delete()
              .eq(item.filterCriteria.column, item.filterCriteria.value);
            error = res.error;
          } else {
            throw new Error(`Unsupported mutation type: ${item.type}`);
          }

          if (error) {
            throw error;
          }

          succeededIds.push(item.id);
          succeeded++;
        } catch (err) {
          // Increment retry count and preserve in queue
          updatedItems.set(item.id, {
            ...item,
            retryCount: item.retryCount + 1,
            status: 'pending',
          });
          failed++;
        }
      }

      // Atomic queue merge: remove only successfully processed IDs, preserving mutations enqueued concurrently
      const currentQueue = this.getMutationQueue();
      const succeededSet = new Set(succeededIds);
      const mergedQueue = currentQueue
        .filter(item => !succeededSet.has(item.id))
        .map(item => updatedItems.get(item.id) || item);

      this.saveMutationQueue(mergedQueue);
      this.lastSyncTimestamp = Date.now();

      return {
        processed: queue.length,
        succeeded,
        failed,
      };
    })();

    try {
      return await this.inFlightProcessPromise;
    } finally {
      this.inFlightProcessPromise = null;
    }
  }

  /**
   * Subscribes to real-time postgres changes on a specified table with RLS tenant filtering.
   */
  public subscribeToTable<T extends Record<string, unknown>>(
    channelName: string,
    table: string,
    callbacks: {
      onInsert?: (record: T) => void;
      onUpdate?: (record: T) => void;
      onDelete?: (oldRecord: Partial<T>) => void;
    },
    filter?: string
  ): RealtimeChannel {
    const client = this.getClient();

    // Clean up existing channel with identical name if present
    if (this.activeSubscriptions.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channelConfig: {
      event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: '*',
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = client
      .channel(channelName)
      .on(
        'postgres_changes' as never,
        channelConfig as never,
        (payload: { eventType: string; new: T; old: Partial<T> }) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete(payload.old);
          }
        }
      )
      .subscribe();

    this.activeSubscriptions.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribes and tears down real-time channel.
   */
  public unsubscribe(channelName: string): void {
    const channel = this.activeSubscriptions.get(channelName);
    if (channel) {
      this.getClient().removeChannel(channel);
      this.activeSubscriptions.delete(channelName);
    }
  }

  /**
   * Returns current sync telemetry and queue depth.
   */
  public getSyncStatus(): SyncStatus {
    const queue = this.getMutationQueue();
    const pendingCount = queue.filter((item) => item.status === 'pending').length;

    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingCount,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };
  }

  /**
   * Clears the mutation queue completely.
   */
  public clearQueue(): void {
    this.storageAdapter.delete(SUPABASE_CONFIG.QUEUE_STORAGE_KEY);
  }
}

export const BackendSync = new BackendSyncManager();
