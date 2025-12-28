import { useState, useEffect } from 'react';
import { getNaverAuthUrl, handleNaverCallback } from '../api/naverApi';
import { getKakaoAuthUrl, handleKakaoCallback } from '../api/kakaoApi';

const Login = () => {
  const [isNaverLoading, setIsNaverLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // URL에서 인증 코드 확인 (콜백 처리)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      // localStorage에서 로그인 시도한 provider 확인
      const provider = localStorage.getItem('pending_login_provider') || 'naver';
      handleLoginCallback(code, state, provider);
    }
  }, []);

  const handleLoginCallback = async (code, state, provider = 'naver') => {
    if (provider === 'kakao') {
      setIsKakaoLoading(true);
    } else {
      setIsNaverLoading(true);
    }
    
    try {
      let result;
      if (provider === 'kakao') {
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        result = await handleKakaoCallback(code, redirectUri);
      } else {
        result = await handleNaverCallback(code, state);
      }
      
      setUser(result.user);
      
      // 토큰 저장 (로컬 스토리지)
      const tokenKey = `${provider}_token`;
      const userKey = `${provider}_user`;
      
      if (result.token) {
        localStorage.setItem(tokenKey, result.token);
      }
      
      // 사용자 정보 저장
      if (result.user) {
        localStorage.setItem(userKey, JSON.stringify(result.user));
        // 최근 로그인 provider 저장
        localStorage.setItem('last_login_provider', provider);
      }

      // pending provider 제거
      localStorage.removeItem('pending_login_provider');
      
      alert(`로그인 성공! ${result.user.name}님 환영합니다.`);
      
      // URL에서 코드 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다: ' + error.message);
    } finally {
      if (provider === 'kakao') {
        setIsKakaoLoading(false);
      } else {
        setIsNaverLoading(false);
      }
    }
  };

  const handleNaverLogin = async () => {
    setIsNaverLoading(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state = Math.random().toString(36).substring(2, 15);
      
      // 로그인 시도 provider 저장
      localStorage.setItem('pending_login_provider', 'naver');
      
      const authUrl = await getNaverAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('네이버 로그인 URL 생성 오류:', error);
      alert('로그인 URL 생성에 실패했습니다: ' + error.message);
      setIsNaverLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state = Math.random().toString(36).substring(2, 15);
      
      // 로그인 시도 provider 저장
      localStorage.setItem('pending_login_provider', 'kakao');
      
      const authUrl = await getKakaoAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('카카오톡 로그인 URL 생성 오류:', error);
      alert('로그인 URL 생성에 실패했습니다: ' + error.message);
      setIsKakaoLoading(false);
    }
  };

  const handleLogout = () => {
    // 모든 provider의 토큰과 사용자 정보 제거
    localStorage.removeItem('naver_token');
    localStorage.removeItem('naver_user');
    localStorage.removeItem('kakao_token');
    localStorage.removeItem('kakao_user');
    localStorage.removeItem('last_login_provider');
    setUser(null);
    alert('로그아웃되었습니다.');
  };

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const lastProvider = localStorage.getItem('last_login_provider') || 'naver';
    const savedUser = localStorage.getItem(`${lastProvider}_user`);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>로그인</h2>
      
      {user ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            <img 
              src={user.profile_image || 'https://via.placeholder.com/100'} 
              alt={user.name}
              style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%',
                marginBottom: '10px'
              }}
            />
            <h3>{user.name}</h3>
            <p style={{ color: '#666' }}>{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleNaverLogin}
            disabled={isNaverLoading || isKakaoLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#03C75A',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isNaverLoading || isKakaoLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: isNaverLoading || isKakaoLoading ? 0.6 : 1
            }}
          >
            {isNaverLoading ? (
              '로딩 중...'
            ) : (
              <>
                <span style={{ fontWeight: 'bold' }}>N</span>
                <span>네이버 로그인</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleKakaoLogin}
            disabled={isNaverLoading || isKakaoLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#FEE500',
              color: '#000000',
              border: 'none',
              borderRadius: '5px',
              cursor: isNaverLoading || isKakaoLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: 'bold',
              opacity: isNaverLoading || isKakaoLoading ? 0.6 : 1
            }}
          >
            {isKakaoLoading ? (
              '로딩 중...'
            ) : (
              <>
                <span>K</span>
                <span>카카오톡 로그인</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
