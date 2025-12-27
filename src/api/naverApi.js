// 네이버 API 호출 함수들

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 네이버 검색 API
export const searchNaver = async (keyword, options = {}) => {
  const { display = 10, start = 1, sort = 'sim' } = options;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/search?query=${encodeURIComponent(keyword)}&display=${display}&start=${start}&sort=${sort}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '검색 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('네이버 검색 오류:', error);
    throw error;
  }
};

// 네이버 로그인 URL 가져오기
export const getNaverAuthUrl = async (redirectUri, state) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/naver/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state || 'random_state'}`
    );

    if (!response.ok) {
      throw new Error('인증 URL 생성 실패');
    }

    const data = await response.json();
    return data.authUrl;
  } catch (error) {
    console.error('네이버 인증 URL 오류:', error);
    throw error;
  }
};

// 네이버 로그인 콜백 처리
export const handleNaverCallback = async (code, state) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/naver/callback?code=${code}&state=${state}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인 실패');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('네이버 로그인 콜백 오류:', error);
    throw error;
  }
};

