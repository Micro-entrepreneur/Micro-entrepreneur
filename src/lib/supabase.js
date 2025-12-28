// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 체크 (개발 환경에서는 경고만 표시)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('다음 환경 변수를 .env 파일에 설정해주세요:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  
  // 개발 환경에서는 더미 클라이언트 반환 (에러 방지)
  if (import.meta.env.DEV) {
    console.warn('개발 모드: Supabase 클라이언트를 생성할 수 없습니다.');
  }
}

// 환경 변수가 있을 때만 클라이언트 생성
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
