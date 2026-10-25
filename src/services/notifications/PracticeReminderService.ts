// src/services/notifications/PracticeReminderService.ts
// Duolingo-style daily practice reminder service for Earpa with harp-themed wit

export interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM" e.g. "09:00", "19:00"
  lastNotifiedDate?: string; // "YYYY-MM-DD"
}

export const HARP_REMINDER_PROMPTS = [
  { title: "Your harp misses you! 🎵", body: "Don't make the red C string cry. 3 minutes of listening keeps your ears sharp." },
  { title: "The bards are watching! 🏛️", body: "5 minutes of ear training beats 5 hours of musician guilt." },
  { title: "Tuning fork check! 🔔", body: "Your tonic anchor is waiting. Can you still find your Do?" },
  { title: "Lever maintenance alert! ⚙️", body: "Don't let your sharping levers get stiff. Come flip a few semitones." },
  { title: "Quick ear workout! ⚡", body: "Just 5 notes to protect your daily streak. The Cliffs of Moher await." },
  { title: "Your harp called... 📞", body: "It said you ghosted. Five quick plucks and all is forgiven." },
  { title: "Unresolved leading tone! 🪕", body: "Degree 7 is hanging in mid-air. Come resolve it home to the tonic." },
  { title: "Spruce belly check! 🪵", body: "The soundboard is primed for resonance. Time for your daily practice." },
  { title: "Don't lose your calluses! ✨", body: "Even Celtic masters practiced daily. Jump into Stage 1 for a quick spin." },
  { title: "Sympathetic resonance! 🎶", body: "Your strings vibrate even when you're not playing. Come make it official." },
  { title: "Ear fatigue antidote! ☕", body: "Take a 2-minute listening break. Your brain will thank you." },
  { title: "Streak protector! 🔥", body: "One lesson stands between you and breaking your streak. Let's do this!" },
];

export class PracticeReminderService {
  private static STORAGE_KEY = 'earpa_practice_reminders';

  public static getConfig(): ReminderConfig {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) return JSON.parse(data);
      }
    } catch {}
    return { enabled: false, time: '19:00' };
  }

  public static saveConfig(config: ReminderConfig): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      }
    } catch {}
  }

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermissionState(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const config = this.getConfig();
        config.enabled = true;
        this.saveConfig(config);
      }
      return perm;
    } catch {
      return 'denied';
    }
  }

  public static getRandomPrompt(): { title: string; body: string } {
    const idx = Math.floor(Math.random() * HARP_REMINDER_PROMPTS.length);
    return HARP_REMINDER_PROMPTS[idx];
  }

  /**
   * Immediately sends a visual practice reminder notification with Earpa icon
   */
  public static async sendTestNotification(): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') return false;
    }

    const prompt = this.getRandomPrompt();
    const iconUrl = '/images/icons/earpa_icon_192.png';
    const badgeUrl = '/images/icons/favicon.png';

    try {
      // If service worker registration is available, use showNotification for mobile PWA support
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(prompt.title, {
          body: prompt.body,
          icon: iconUrl,
          badge: badgeUrl,
          tag: 'earpa-daily-practice',
          data: { url: '/' },
        } as any);
        return true;
      }

      // Standard desktop/mobile browser fallback
      const notif = new Notification(prompt.title, {
        body: prompt.body,
        icon: iconUrl,
        badge: badgeUrl,
        tag: 'earpa-daily-practice',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (err) {
      console.warn('Notification trigger error:', err);
      return false;
    }
  }
}
