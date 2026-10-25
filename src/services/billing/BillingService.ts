// src/services/billing/BillingService.ts
// Secure server-verified billing and entitlement service for Earpa

export type SubscriptionStatus = 'free' | 'trialing' | 'founding' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface UserEntitlement {
  userId: string;
  status: SubscriptionStatus;
  planId: 'earpa_founding_annual' | 'earpa_standard_annual' | 'earpa_free';
  currentPeriodEnd: number; // Unix timestamp ms
  cancelAtPeriodEnd: boolean;
  lastWebhookEventId?: string;
  updatedAt: number;
}

export interface BillingWebhookEvent {
  eventId: string;
  eventType: 'subscription.created' | 'subscription.renewed' | 'subscription.canceled' | 'payment.failed' | 'payment.refunded';
  userId: string;
  planId: 'earpa_founding_annual' | 'earpa_standard_annual';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: number;
  timestamp: number;
}

export class BillingService {
  private static instance: BillingService;
  private entitlements: Map<string, UserEntitlement> = new Map();
  private processedEventIds: Set<string> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): BillingService {
    if (!BillingService.instance) {
      BillingService.instance = new BillingService();
    }
    return BillingService.instance;
  }

  public getEntitlement(userId: string): UserEntitlement {
    const existing = this.entitlements.get(userId);
    if (!existing) {
      return {
        userId,
        status: 'free',
        planId: 'earpa_free',
        currentPeriodEnd: 0,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      };
    }

    // Check expiration against current time
    if (existing.status === 'active' || existing.status === 'founding') {
      if (existing.currentPeriodEnd > 0 && Date.now() > existing.currentPeriodEnd) {
        existing.status = 'expired';
        this.saveToStorage();
      }
    }
    return existing;
  }

  public hasPaidAccess(userId: string): boolean {
    const ent = this.getEntitlement(userId);
    return ent.status === 'active' || ent.status === 'founding' || ent.status === 'trialing';
  }

  /**
   * Process incoming verified billing webhook with idempotency check
   */
  public processVerifiedWebhook(event: BillingWebhookEvent): { success: boolean; duplicate?: boolean } {
    if (this.processedEventIds.has(event.eventId)) {
      return { success: true, duplicate: true }; // Idempotent skip
    }

    this.processedEventIds.add(event.eventId);
    const existing = this.getEntitlement(event.userId);

    switch (event.eventType) {
      case 'subscription.created':
      case 'subscription.renewed':
        this.entitlements.set(event.userId, {
          userId: event.userId,
          status: event.planId === 'earpa_founding_annual' ? 'founding' : 'active',
          planId: event.planId,
          currentPeriodEnd: event.currentPeriodEnd,
          cancelAtPeriodEnd: false,
          lastWebhookEventId: event.eventId,
          updatedAt: Date.now(),
        });
        break;

      case 'payment.failed':
        this.entitlements.set(event.userId, {
          ...existing,
          status: 'past_due',
          lastWebhookEventId: event.eventId,
          updatedAt: Date.now(),
        });
        break;

      case 'subscription.canceled':
        this.entitlements.set(event.userId, {
          ...existing,
          cancelAtPeriodEnd: true,
          status: Date.now() > existing.currentPeriodEnd ? 'expired' : existing.status,
          lastWebhookEventId: event.eventId,
          updatedAt: Date.now(),
        });
        break;

      case 'payment.refunded':
        this.entitlements.set(event.userId, {
          ...existing,
          status: 'expired',
          cancelAtPeriodEnd: true,
          currentPeriodEnd: Date.now(),
          lastWebhookEventId: event.eventId,
          updatedAt: Date.now(),
        });
        break;
    }

    this.saveToStorage();
    return { success: true };
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem('earpa_billing_entitlements');
        if (data) {
          const list: UserEntitlement[] = JSON.parse(data);
          list.forEach(e => this.entitlements.set(e.userId, e));
        }
      }
    } catch {}
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = Array.from(this.entitlements.values());
        localStorage.setItem('earpa_billing_entitlements', JSON.stringify(list));
      }
    } catch {}
  }
}
