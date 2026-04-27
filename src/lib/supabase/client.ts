import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function hasUsableSupabaseEnv(url?: string, anonKey?: string): boolean {
  if (!url || !anonKey) return false;
  if (url.includes('example.supabase.co')) return false;
  if (url.includes('your_supabase_project_url')) return false;
  if (anonKey.includes('your_supabase_anon_key')) return false;
  if (anonKey === 'dummy-anon-key') return false;
  return true;
}

export const isSupabaseConfigured = hasUsableSupabaseEnv(
  supabaseUrl,
  supabaseAnonKey
);

const resolvedSupabaseUrl = isSupabaseConfigured
  ? supabaseUrl!
  : 'https://example.supabase.co';
const resolvedSupabaseAnonKey = isSupabaseConfigured
  ? supabaseAnonKey!
  : 'local-development-anon-key';

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function testConnection() {
  if (!isSupabaseConfigured) return false;

  try {
    const { data, error } = await supabase.from('papers').select('count');
    if (error) throw error;
    console.log('✅ Supabase 연결 성공!');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 실패:', error);
    return false;
  }
}
