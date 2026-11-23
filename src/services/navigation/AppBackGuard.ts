import { useEffect, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';

export type BackEventSource = 'popstate' | 'edge-swipe' | 'hardware' | 'button';

type BackHandlerEntry = {
  id: string;
  priority: number;
  handler: () => boolean;
};

/**
 * EARPA UNIVERSAL BACK-GESTURE & HISTORY GUARD
 * Prevents accidental app exits on Android edge-swipe, hardware back, iOS Safari
 * edge-swipe, and browser Back buttons across all devices. Routes every Back
 * action to the most recent in-app place (modals -> sub-views -> tab history),
 * and at root requires two consecutive Back actions to open a Quit confirmation.
 */
class AppBackGuardController {
  private static instance: AppBackGuardController | null = null;
  private initialized = false;
  private handlers: BackHandlerEntry[] = [];
  private rootBackListener: (() => void) | null = null;

  private isQuitting = false;
  private pushedDepth = 0;
  private seq = 0;
  private hasUserActivatedSentinel = false;
  private lastPopstateTs = 0;
  private lastEdgeSwipeTs = 0;
  private cleanupFns: Array<() => void> = [];

  public static getInstance(): AppBackGuardController {
    if (!AppBackGuardController.instance) {
      AppBackGuardController.instance = new AppBackGuardController();
    }
    return AppBackGuardController.instance;
  }

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (Platform.OS === 'android') {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        this.dispatchBack('hardware');
        return true;
      });
      this.cleanupFns.push(() => sub.remove());
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.initWebBackGuard();
    }
  }

  private pushSentinel(activated = false): void {
    if (typeof window === 'undefined' || !window.history || this.isQuitting) return;
    try {
      this.seq += 1;
      this.pushedDepth += 1;
      window.history.pushState(
        { __earpaBackGuard: true, seq: this.seq, activated },
        '',
        window.location.href
      );
    } catch {}
  }

  private initWebBackGuard(): void {
    try {
      // Anchor base state and place an initial sentinel entry above it
      if (!window.history.state?.__earpaBackGuard) {
        window.history.replaceState(
          { __earpaBackRoot: true, seq: 0 },
          '',
          window.location.href
        );
        this.pushSentinel(false);
      }
    } catch {}

    // Ensure a user-activated sentinel exists (Chromium 115+ History Intervention compliance)
    const onFirstUserActivation = () => {
      if (this.hasUserActivatedSentinel || this.isQuitting) return;
      this.hasUserActivatedSentinel = true;
      this.pushSentinel(true);
    };

    window.addEventListener('pointerdown', onFirstUserActivation, { capture: true, passive: true });
    window.addEventListener('touchstart', onFirstUserActivation, { capture: true, passive: true });
    window.addEventListener('keydown', onFirstUserActivation, { capture: true, passive: true });

    // Intercept browser Back / Android edge-swipe Back / Android nav bar Back
    const onPopState = () => {
      if (this.isQuitting) return;
      const now = Date.now();
      this.pushedDepth = Math.max(0, this.pushedDepth - 1);

      // Immediately re-arm the sentinel so the user NEVER falls out of the app
      this.pushSentinel(true);

      // Deduplicate if the same physical edge-swipe already fired via touch listener
      if (now - this.lastEdgeSwipeTs < 350) return;
      this.lastPopstateTs = now;
      this.dispatchBack('popstate');
    };

    window.addEventListener('popstate', onPopState);

    // Intercept iOS Safari / WebView screen-edge swipe gestures
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    const isAppleTouch =
      /iPad|iPhone|iPod/.test(ua) ||
      (typeof navigator !== 'undefined' &&
        navigator.platform === 'MacIntel' &&
        (navigator as any).maxTouchPoints > 1);

    let edgeStartX: number | null = null;
    let edgeStartY: number | null = null;
    let edgeStartTime = 0;
    let edgeSide: 'left' | 'right' | null = null;

    const isEditableOrMediaTarget = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'VIDEO';
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isEditableOrMediaTarget(e.target)) {
        edgeSide = null;
        return;
      }
      const touch = e.touches[0];
      const vw = window.innerWidth || 412;
      const x = touch.clientX;

      if (x <= 22) {
        edgeSide = 'left';
        edgeStartX = x;
        edgeStartY = touch.clientY;
        edgeStartTime = Date.now();
        // Prevent iOS Safari native swipe-back transition from leaving the app
        if (isAppleTouch && e.cancelable) {
          e.preventDefault();
        }
      } else if (x >= vw - 22) {
        edgeSide = 'right';
        edgeStartX = x;
        edgeStartY = touch.clientY;
        edgeStartTime = Date.now();
        if (isAppleTouch && e.cancelable) {
          e.preventDefault();
        }
      } else {
        edgeSide = null;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!edgeSide || edgeStartX === null || edgeStartY === null) return;
      const changed = e.changedTouches && e.changedTouches[0];
      const side = edgeSide;
      const sx = edgeStartX;
      const sy = edgeStartY;
      const dt = Date.now() - edgeStartTime;
      edgeSide = null;
      edgeStartX = null;
      edgeStartY = null;

      if (!changed || dt > 700) return;
      const dx = changed.clientX - sx;
      const dy = changed.clientY - sy;

      const isLeftEdgeInward = side === 'left' && dx >= 56 && Math.abs(dx) > Math.abs(dy) * 1.6;
      const isRightEdgeInward = side === 'right' && dx <= -56 && Math.abs(dx) > Math.abs(dy) * 1.6;

      if (isLeftEdgeInward || isRightEdgeInward) {
        const now = Date.now();
        if (now - this.lastPopstateTs < 350) return;
        this.lastEdgeSwipeTs = now;
        this.dispatchBack('edge-swipe');
      }
    };

    window.addEventListener('touchstart', onTouchStart, { capture: true, passive: false });
    window.addEventListener('touchend', onTouchEnd, { capture: true, passive: true });

    this.cleanupFns.push(() => {
      window.removeEventListener('pointerdown', onFirstUserActivation, true);
      window.removeEventListener('touchstart', onFirstUserActivation, true);
      window.removeEventListener('keydown', onFirstUserActivation, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchend', onTouchEnd, true);
    });
  }

  public registerHandler(id: string, handler: () => boolean, priority = 10): () => void {
    this.handlers = this.handlers.filter((h) => h.id !== id);
    this.handlers.push({ id, priority, handler });
    return () => {
      this.handlers = this.handlers.filter((h) => h.id !== id);
    };
  }

  public setRootBackListener(listener: (() => void) | null): void {
    this.rootBackListener = listener;
  }

  public notifyInAppNavigation(): void {
    // Reinforce sentinel after meaningful in-app navigation so Back always maps cleanly
    if (Platform.OS === 'web' && this.hasUserActivatedSentinel && !this.isQuitting) {
      if (typeof window !== 'undefined' && !window.history.state?.__earpaBackGuard) {
        this.pushSentinel(true);
      }
    }
  }

  public dispatchBack(_source: BackEventSource = 'button'): void {
    if (this.isQuitting) return;

    // Sort descending by priority, breaking ties by most-recently-registered (LIFO)
    const ordered = [...this.handlers]
      .map((entry, idx) => ({ entry, idx }))
      .sort((a, b) =>
        b.entry.priority !== a.entry.priority ? b.entry.priority - a.entry.priority : b.idx - a.idx
      );

    for (const { entry } of ordered) {
      try {
        const handled = entry.handler();
        if (handled) {
          return;
        }
      } catch (err) {
        console.warn('[AppBackGuard] Handler error:', entry.id, err);
      }
    }

    // No open modal, sub-view, or earlier in-app place -> notify root double-back controller
    this.rootBackListener?.();
  }

  public confirmQuitApp(): void {
    this.isQuitting = true;

    if (Platform.OS === 'android') {
      try {
        BackHandler.exitApp();
      } catch {}
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.close();
      } catch {}
      try {
        const stepsBack = Math.max(2, this.pushedDepth + 1);
        window.history.go(-stepsBack);
      } catch {}

      // If running inside an OS container that blocks programmatic exit, cleanly re-arm guard
      setTimeout(() => {
        this.isQuitting = false;
        this.pushedDepth = 0;
        this.pushSentinel(true);
      }, 900);
    }
  }
}

export const AppBackGuard = AppBackGuardController.getInstance();

/**
 * Hook for any modal, overlay, or screen to claim Back gestures while active.
 * Higher priority values close first (e.g. quit dialog = 100, nested modal = 60,
 * primary modal = 40, sub-screen = 20, hub history = 10).
 */
export function useBackHandler(
  id: string,
  enabled: boolean,
  onBack: () => boolean,
  priority = 40
): void {
  const callbackRef = useRef(onBack);
  callbackRef.current = onBack;

  useEffect(() => {
    if (!enabled) return;
    AppBackGuard.init();
    return AppBackGuard.registerHandler(id, () => callbackRef.current(), priority);
  }, [id, enabled, priority]);
}
