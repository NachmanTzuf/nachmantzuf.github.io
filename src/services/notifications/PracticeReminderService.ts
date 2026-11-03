import { cloud } from '../account/CloudAccounts';
import { validTime, localDay, reminderDue } from './ReminderSchedule';

export interface ReminderConfig {
  enabled: boolean;
  time: string;
  lastNotifiedDate?: string;
  background?: boolean;
}

export const HARP_REMINDER_PROMPTS = [
  {
    title: 'Earpa · Time for 10 minutes of listening',
    body: 'Your Celtic harp misses your fingers! Take 10 relaxing minutes to find your tonic.',
  },
  {
    title: 'Earpa · Evening Ear Sanctuary',
    body: 'The strings are tuned and ready! Can you hit a 5-streak in tonight’s session?',
  },
  {
    title: 'Earpa · Your Daily Harper Habit',
    body: 'Single notes, melodies or levers: just 10 minutes today keeps your interval reflexes razor sharp.',
  },
  {
    title: 'Earpa · Musical Sunset Chime',
    body: 'Step into your Celtic sanctuary for 10 minutes. A calm musical moment awaits you.',
  },
  {
    title: 'Earpa · New Shards to Unlock',
    body: 'Play a quick round, hone your modal ear, and gather shards for custom harp finishes!',
  },
];

export class PracticeReminderService {
  private static key = 'earpa_practice_reminders';
  private static sending = false;

  static getConfig(): ReminderConfig {
    try {
      const c = JSON.parse(localStorage.getItem(this.key) || 'null');
      if (c && validTime(c.time)) return c;
    } catch {}
    return { enabled: false, time: '18:30' };
  }

  static saveConfig(config: ReminderConfig) {
    if (!validTime(config.time)) throw new Error('Use a time such as 18:30.');
    try {
      localStorage.setItem(this.key, JSON.stringify(config));
    } catch {
      throw new Error('Reminder preferences could not be saved on this device.');
    }
  }

  static isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  static getPermissionState(): NotificationPermission {
    return this.isSupported() ? Notification.permission : 'denied';
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  static getRandomPrompt() {
    return HARP_REMINDER_PROMPTS[Math.floor(Math.random() * HARP_REMINDER_PROMPTS.length)];
  }

  static async registration() {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable.');
    await navigator.serviceWorker.register('/sw.js');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('The notification service did not become ready. Please retry.')), 8000);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  static async configure(enabled: boolean, time: string): Promise<string> {
    if (!validTime(time)) throw new Error('Enter a valid 24-hour time (HH:MM).');
    if (!enabled) {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager?.getSubscription();
        if (sub) {
          if (cloud) {
            const { error } = await cloud.from('earpa_push_subscriptions').delete().eq('endpoint', sub.endpoint);
            if (error) console.warn('Could not remove cloud push record:', error);
          }
          await sub.unsubscribe();
        }
      }
      this.saveConfig({ ...this.getConfig(), enabled: false, background: false, time });
      return 'Daily practice reminders turned off.';
    }

    const perm = await this.requestPermission();
    if (perm !== 'granted') {
      throw new Error(
        'Notifications permission was not granted. Please allow notifications in your browser or device settings.'
      );
    }

    const vapid = process.env.EXPO_PUBLIC_WEB_PUSH_KEY;
    if (!cloud || !vapid) {
      this.saveConfig({ ...this.getConfig(), enabled: true, time, background: false });
      return `Daily practice reminders set for ${time}! Active on this device.`;
    }

    try {
      const { data: { user } } = await cloud.auth.getUser();
      if (!user) {
        this.saveConfig({ ...this.getConfig(), enabled: true, time, background: false });
        return `Daily practice reminders set for ${time}! Active on this device.`;
      }
      const reg = await this.registration();
      const base64 = vapid.replace(/-/g, '+').replace(/_/g, '/');
      const key = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
      const json = sub.toJSON();
      await cloud.from('earpa_push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          local_time: time,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          enabled: true,
        },
        { onConflict: 'endpoint' }
      );
      this.saveConfig({ ...this.getConfig(), enabled: true, time, background: true });
      return `Cloud & local reminders scheduled for ${time}!`;
    } catch {
      this.saveConfig({ ...this.getConfig(), enabled: true, time, background: false });
      return `Daily practice reminders set for ${time}! Active on this device.`;
    }
  }

  static async sendTestNotification(): Promise<boolean> {
    if (!this.isSupported()) return false;
    let perm = this.getPermissionState();
    if (perm !== 'granted') {
      perm = await this.requestPermission();
    }
    if (perm !== 'granted') return false;
    return this.dispatchNotification();
  }

  static async checkAndDispatchDailyReminder(): Promise<boolean> {
    const config = this.getConfig();
    if (this.sending || !reminderDue(config) || this.getPermissionState() !== 'granted') return false;
    this.sending = true;
    try {
      const sent = await this.dispatchNotification();
      if (sent) this.saveConfig({ ...config, lastNotifiedDate: localDay(new Date()) });
      return sent;
    } finally {
      this.sending = false;
    }
  }

  private static async dispatchNotification(): Promise<boolean> {
    if (this.getPermissionState() !== 'granted') return false;
    const prompt = this.getRandomPrompt();
    const options = {
      body: prompt.body,
      icon: '/images/icons/earpa_icon_192.png',
      badge: '/images/icons/earpa_icon_192.png',
      tag: 'earpa-daily-practice',
      data: { url: '/' },
    };
    try {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await this.registration();
          if (reg && reg.showNotification) {
            await reg.showNotification(prompt.title, options);
            return true;
          }
        } catch {}
      }
      if ('Notification' in window) {
        new Notification(prompt.title, options);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Dispatch notification error:', e);
      return false;
    }
  }
}
