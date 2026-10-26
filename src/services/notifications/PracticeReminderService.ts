// src/services/notifications/PracticeReminderService.ts
// Duolingo-style daily practice reminder service for Earpa with cute, playful harp prompts

export interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM" e.g. "18:30"
  lastNotifiedDate?: string; // "YYYY-MM-DD" in local timezone
}

export const HARP_REMINDER_PROMPTS = [
  {
    title: "Evening harp time! 🪕",
    body: "Just 10 minutes of listening tonight will make your ears glow and keep your pitch sharp."
  },
  {
    title: "Cozy sunset practice! 🌅",
    body: "10 playful minutes before dinner! Can you find your tonic anchor on the first try?"
  },
  {
    title: "The bards are tuning up! 🏛️",
    body: "10 minutes of ear training beats hours of musician guilt. Jump in for a quick round!"
  },
  {
    title: "Your 10-minute ear spa! ✨",
    body: "Unwind tonight with gentle Celtic strings, Sitka spruce resonance, and modal melodies."
  },
  {
    title: "Streak protector alert! 🔥",
    body: "Only 10 minutes stands between you and your highest streak yet. Let's make it ring!"
  },
  {
    title: "A quick 10-minute pluck! 🎵",
    body: "The red C string missed you today! 10 minutes of ear training keeps your fingers nimble."
  },
  {
    title: "Evening resonance check! 🌙",
    body: "Anchor your Do tonight. 10 peaceful minutes on the harp will have you hearing melodies in your sleep."
  },
  {
    title: "10 minutes of musical bliss! ☕",
    body: "Take a cozy 10-minute break with the Celtic harp. Can you hit a flawless 5-round streak?"
  },
  {
    title: "Feel the tonal gravity! 🌌",
    body: "Degree 7 is calling you home. Give your ears 10 minutes of love before the day ends."
  },
  {
    title: "Don't let the levers get lonely! ⚙️",
    body: "10 minutes of sharping lever fun! Come flip a few semitones and master new modes."
  },
  {
    title: "Soundboard sunset serenade! 🪵",
    body: "The spruce belly is primed for resonance. 10 minutes tonight makes tomorrow's solos effortless."
  },
  {
    title: "Sweet 10-minute ear workout! ⚡",
    body: "10 minutes of ear training today, effortless playing by ear forever. Ready to play?"
  },
  {
    title: "Golden tone check-in! 🔔",
    body: "Your daily 10 minutes of Celtic harp mastery starts now. The bards are cheering for you!"
  },
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
    return { enabled: false, time: '18:30' };
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
    return this.dispatchNotification();
  }

  /**
   * Evaluates if current local device time is between 18:00 and 19:00 (6:00-7:00 PM),
   * and if notifications are enabled and haven't yet been sent today in the user's timezone.
   */
  public static async checkAndDispatchDailyReminder(): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') return false;

    const config = this.getConfig();
    if (!config.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours(); // Local device timezone

    // Target evening window: 18:00 to 19:00 (6:00 PM - 7:00 PM) in user's local timezone
    if (currentHour < 18 || currentHour >= 19) return false;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (config.lastNotifiedDate === todayStr) return false; // Already notified today!

    const sent = await this.dispatchNotification();
    if (sent) {
      config.lastNotifiedDate = todayStr;
      this.saveConfig(config);
    }
    return sent;
  }

  private static async dispatchNotification(): Promise<boolean> {
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
