import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Supabase 환경 변수가 설정되지 않았습니다!\n' +
    '.env.local 파일을 확인하세요.\n' +
    'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 개인용 앱이므로 인증 비활성화 (선택적)
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 연결 테스트 함수
export async function testConnection() {
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
