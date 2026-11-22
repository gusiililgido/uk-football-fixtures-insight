import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://iteqgzpmgzqehgzbqcox.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_tSlxwJwBgD1vQtRXD0ppGQ_B303NRzL';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function fetchCloudState<T>(key: string): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error || !data) return null;
    return data.value as T;
  } catch {
    return null;
  }
}

export async function saveCloudState<T>(
  key: string,
  value: T
): Promise<{ ok: boolean; errorMsg?: string }> {
  if (!supabase) return { ok: false, errorMsg: 'Supabase not configured' };
  try {
    const { error } = await supabase
      .from('app_state')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    if (error) return { ok: false, errorMsg: error.message };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, errorMsg: err?.message || 'Network error' };
  }
}
