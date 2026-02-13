import { useEffect, useState } from 'react';

const SESSION_KEY = 'csi_user_session_id';
const DEFAULT_SESSION_ID = 'default_user';

/**
 * 로컬 세션 ID 관리 훅
 * 로그인 없이 사용자를 식별하기 위한 로컬 스토리지 기반 세션
 */
export function useSession() {
  const [sessionId, setSessionId] = useState<string>(DEFAULT_SESSION_ID);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSessionId(stored);
      } else {
        // UUID 대신 간단한 타임스탬프 기반 ID 사용
        const newId = `user_${Date.now()}`;
        localStorage.setItem(SESSION_KEY, newId);
        setSessionId(newId);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      // 로컬 스토리지 실패 시 기본값 사용
      setSessionId(DEFAULT_SESSION_ID);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetSession = () => {
    const newId = `user_${Date.now()}`;
    localStorage.setItem(SESSION_KEY, newId);
    setSessionId(newId);
  };

  return {
    sessionId,
    isLoading,
    resetSession,
  };
}
