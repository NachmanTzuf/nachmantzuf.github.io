import {createClient} from '@supabase/supabase-js';
import {UserAccountDatabase} from './UserAccountDatabase';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const cloud = url && key ? createClient(url, key) : null;

export async function syncCloudAccount() {
  if (!cloud) throw new Error('Cloud accounts have not been connected. Your local profile is saved.');
  const { data: { user }, error: authError } = await cloud.auth.getUser();
  if (authError || !user) throw new Error('Sign in with your email first.');
  const db = UserAccountDatabase.getInstance();
  const { data: remote, error: readError } = await cloud.from('earpa_profiles').select('payload').eq('user_id', user.id).maybeSingle();
  if (readError) throw readError;
  const { data: records, error: recordsError } = await cloud.from('earpa_records').select('kind,payload').eq('user_id', user.id);
  if (recordsError) throw recordsError;

  // A verified account has its own local identity; never upload another local player's history.
  db.openCloudProfile(user.id, remote?.payload, records || []);
  const snapshot = db.getCloudSnapshot();
  const { error: profileError } = await cloud.from('earpa_profiles').upsert({ user_id: user.id, payload: snapshot.profile });
  if (profileError) throw profileError;
  if (snapshot.records.length) {
    const { error } = await cloud.from('earpa_records').upsert(
      snapshot.records.map(r => ({ user_id: user.id, record_id: r.payload.id, kind: r.kind, payload: r.payload })),
      { onConflict: 'user_id,record_id' }
    );
    if (error) throw error;
  }
  return user.email || 'Signed in';
}

export async function migrateActiveLocalProfileToCloud() {
  if (!cloud) throw new Error('Cloud accounts have not been connected. Your local profile is saved.');
  const { data: { user }, error: authError } = await cloud.auth.getUser();
  if (authError || !user) throw new Error('Sign in with your email first.');
  const db = UserAccountDatabase.getInstance();
  const current = db.getActiveProfile();
  if (current.id === user.id) return syncCloudAccount();

  // Explicit migration: reassign local trials and sessions to cloud user ID
  const localTrials = db.getUserTrials(current.id);
  const localSessions = db.getUserSessions(current.id);

  const { data: remote } = await cloud.from('earpa_profiles').select('payload').eq('user_id', user.id).maybeSingle();
  const { data: records } = await cloud.from('earpa_records').select('kind,payload').eq('user_id', user.id);

  const combinedRecords = [
    ...(records || []),
    ...localTrials.map(t => ({ kind: 'trial', payload: { ...t, userId: user.id } })),
    ...localSessions.map(s => ({ kind: 'session', payload: { ...s, userId: user.id } })),
  ];

  db.openCloudProfile(user.id, remote?.payload || current, combinedRecords);
  const snapshot = db.getCloudSnapshot();
  const { error: profileError } = await cloud.from('earpa_profiles').upsert({ user_id: user.id, payload: snapshot.profile });
  if (profileError) throw profileError;
  if (snapshot.records.length) {
    const { error } = await cloud.from('earpa_records').upsert(
      snapshot.records.map(r => ({ user_id: user.id, record_id: r.payload.id, kind: r.kind, payload: r.payload })),
      { onConflict: 'user_id,record_id' }
    );
    if (error) throw error;
  }
  return user.email || 'Migrated';
}
