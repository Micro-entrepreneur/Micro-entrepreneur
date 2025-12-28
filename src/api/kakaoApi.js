// 카카오톡 API 호출 함수들

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 카카오톡 로그인 URL 가져오기
export const getKakaoAuthUrl = async (redirectUri, state) => {
  try {
    const url = `${API_BASE_URL}/api/kakao/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state || 'random_state'}`;
    console.log('카카오톡 인증 URL 요청:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('카카오톡 인증 URL 응답 오류:', response.status, errorText);
      throw new Error(`인증 URL 생성 실패 (${response.status}): ${errorText || '서버 응답 오류'}`);
    }

    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('카카오톡 인증 URL 오류:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (${API_BASE_URL})`);
    }
    throw error;
  }
};

// 카카오톡 로그인 콜백 처리
export const handleKakaoCallback = async (code, redirectUri) => {
  try {
    const redirect = redirectUri || `${window.location.origin}${window.location.pathname}`;
    const response = await fetch(
      `${API_BASE_URL}/api/kakao/callback?code=${code}&redirect_uri=${encodeURIComponent(redirect)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('카카오톡 로그인 콜백 오류:', error);
    throw error;
  }
};

// 카카오 로컬 검색 API
export const searchKakao = async (keyword, options = {}) => {
  const { display = 10, page = 1, sort = 'accuracy' } = options;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?query=${encodeURIComponent(keyword)}&display=${display}&page=${page}&sort=${sort}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '검색 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('카카오 로컬 검색 오류:', error);
    throw error;
  }
};

