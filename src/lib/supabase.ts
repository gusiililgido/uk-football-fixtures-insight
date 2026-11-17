import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export async function fetchCloudState<T>(key: string): Promise<T | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('payload')
      .eq('id', key)
      .maybeSingle();

    if (error || !data) return null;
    return data.payload as T;
  } catch {
    return null;
  }
}

export async function saveCloudState<T>(key: string, payload: T): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('app_state').upsert({
      id: key,
      payload,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Keep local state if temporarily offline
  }
}
