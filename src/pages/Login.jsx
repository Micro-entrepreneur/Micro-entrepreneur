import { useState, useEffect } from 'react';
import { getNaverAuthUrl, handleNaverCallback } from '../api/naverApi';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // URL에서 인증 코드 확인 (콜백 처리)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      handleLoginCallback(code, state);
    }
  }, []);

  const handleLoginCallback = async (code, state) => {
    setIsLoading(true);
    try {
      const result = await handleNaverCallback(code, state);
      setUser(result.user);
      
      // 토큰 저장 (로컬 스토리지)
      if (result.token) {
        localStorage.setItem('naver_token', result.token);
      }
      
      // 사용자 정보 저장
      if (result.user) {
        localStorage.setItem('naver_user', JSON.stringify(result.user));
      }

      alert(`로그인 성공! ${result.user.name}님 환영합니다.`);
      
      // URL에서 코드 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const state = Math.random().toString(36).substring(2, 15);
      
      const authUrl = await getNaverAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('네이버 로그인 URL 생성 오류:', error);
      alert('로그인 URL 생성에 실패했습니다: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('naver_token');
    localStorage.removeItem('naver_user');
    setUser(null);
    alert('로그아웃되었습니다.');
  };

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const savedUser = localStorage.getItem('naver_user');
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
        <button
          onClick={handleNaverLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#03C75A',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {isLoading ? (
            '로딩 중...'
          ) : (
            <>
              <span>N</span>
              <span>네이버 로그인</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default Login;
