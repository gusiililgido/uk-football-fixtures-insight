import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_tSlxwJwBgD1vQtRXD0ppGQ_B303NRzL';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchCloudState<T>(key: string): Promise<T | null> {
  if (!supabase) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, error } = await supabase
        .from('app_state')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (!error && data) return data.value as T;
      if (error) await wait(600 * (attempt + 1));
      else return null;
    } catch {
      await wait(600 * (attempt + 1));
    }
  }
  return null;
}

export async function saveCloudState<T>(
  key: string,
  value: T
): Promise<{ ok: boolean; errorMsg?: string }> {
  if (!supabase) return { ok: false, errorMsg: 'Supabase not configured' };
  let lastError = 'Network error';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { error } = await supabase
        .from('app_state')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (!error) return { ok: true };
      lastError = error.message;
    } catch (err: any) {
      lastError = err?.message || 'Network hiccup — retrying';
    }
    await wait(700 * (attempt + 1));
  }
  return { ok: false, errorMsg: lastError };
}
