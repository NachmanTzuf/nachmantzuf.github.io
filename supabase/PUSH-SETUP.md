# Daily Web Push activation
The app previously polled only while open and ignored the saved time. The repaired client distinguishes open-app reminders from server delivery.

1. Apply push-reminders.sql to the existing project. Confirm per-user RLS with two accounts.
2. Generate VAPID keys using web-push. Store private key only in Edge Function secrets, never an EXPO_PUBLIC variable.
3. Set server VAPID_SUBJECT to a support mailto address, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and a random REMINDER_CRON_SECRET. Existing Supabase runtime provides service credentials.
4. Deploy send-practice-reminders with JWT verification disabled only because its handler authenticates the separate cron secret. Do not expose that secret to clients.
5. Schedule an authenticated HTTPS call every minute using Supabase Cron and Vault for the cron secret. The database claims due subscriptions in local time, with a ten-minute retry lease and daily deduplication.
6. Set EXPO_PUBLIC_WEB_PUSH_KEY to the public VAPID key and rebuild. Sign in, enable reminders via a user gesture, save a time, send a test.
7. Validate installed iPhone PWA and Android Chrome with app closed, device reboot, revoked permission, expired subscription, timezone changes, and daylight saving. Re-save the schedule after a timezone change. Delivery is best effort, not an exact 24-hour guarantee. A crash after provider acceptance but before database acknowledgement can retry; notification tags collapse duplicates.

Deployment and real-device delivery remain unverified until the project, keys and cron are configured. Native Expo local notifications are not installed; this release targets the existing web/PWA app.
