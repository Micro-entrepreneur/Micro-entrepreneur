import { useState, useEffect } from 'react';
import { getNaverAuthUrl, handleNaverCallback } from '../api/naverApi';
import { getKakaoAuthUrl, handleKakaoCallback } from '../api/kakaoApi';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import './Login.css';
import defaultAvatar from '/img/login/default-avatar.jpg';

const Login = () => {
  const navigate = useNavigate(); // ✅ useNavigate 훅 사용

  const [isNaverLoading, setIsNaverLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ formData 상태 추가
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('카카오 로그인 에러:', error);
      alert(`로그인에 실패했습니다: ${error}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      const provider = localStorage.getItem('pending_login_provider') || 'naver';
      const processedCode = sessionStorage.getItem('processed_code');

      if (processedCode === code) {
        console.log('이미 처리된 인증 코드입니다.');
        return;
      }

      sessionStorage.setItem('processed_code', code);
      handleLoginCallback(code, state, provider);
    }
  }, []);

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const lastProvider = localStorage.getItem('last_login_provider') || 'naver';
    const savedUser = localStorage.getItem(`${lastProvider}_user`);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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

      const tokenKey = `${provider}_token`;
      const userKey = `${provider}_user`;

      if (result.token) {
        localStorage.setItem(tokenKey, result.token);
      }

      if (result.user) {
        localStorage.setItem(userKey, JSON.stringify(result.user));
        localStorage.setItem('last_login_provider', provider);
      }

      localStorage.removeItem('pending_login_provider');
      sessionStorage.removeItem('processed_code');

      alert(`로그인 성공! ${result.user.name}님 환영합니다.`);
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

      localStorage.setItem('pending_login_provider', 'kakao');

      const authUrl = await getKakaoAuthUrl(redirectUri, state);
      window.location.href = authUrl;
    } catch (error) {
      console.error('카카오톡 로그인 URL 생성 오류:', error);
      alert('로그인 URL 생성에 실패했습니다: ' + error.message);
      setIsKakaoLoading(false);
    }
  };

  // ✅ 입력값 변경 핸들러 추가
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Supabase 이메일 로그인
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Supabase 클라이언트 확인
      if (!supabase) {
        setError('Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        console.error('Supabase 로그인 오류:', error);

        // 에러 메시지 처리
        let errorMessage = error.message;
        if (error.message.includes('Email not confirmed') || error.message.includes('email not confirmed')) {
          errorMessage = '이메일 인증이 완료되지 않았습니다. 가입하신 이메일을 확인하여 인증을 완료해주세요.';

          // 인증 이메일 재발송 옵션 제공
          if (confirm('인증 이메일을 다시 받으시겠습니까?')) {
            try {
              const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: formData.email.trim(),
              });

              if (resendError) {
                console.error('인증 이메일 재발송 오류:', resendError);
                errorMessage += '\n인증 이메일 재발송에 실패했습니다.';
              } else {
                errorMessage = '인증 이메일을 다시 발송했습니다. 이메일을 확인해주세요.';
              }
            } catch (resendErr) {
              console.error('인증 이메일 재발송 예외:', resendErr);
            }
          }
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.message.includes('User not found')) {
          errorMessage = '등록되지 않은 이메일입니다.';
        }

        setError(errorMessage);
        return;
      }

      console.log('로그인 성공:', data);

      // 사용자 정보 localStorage에 저장
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('last_login_provider', 'email');

        // 사용자 정보 설정 (UI 표시용)
        setUser({
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '사용자',
          email: data.user.email,
          profile_image: defaultAvatar,
          provider: 'email',
        });
      }

      navigate('/'); // ✅ 올바른 네비게이션
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ 로그아웃 (하나로 통합)
  const handleLogout = async () => {
    // Supabase 로그아웃
    const { error } = await supabase.auth.signOut();

    // 모든 provider의 토큰과 사용자 정보 제거
    localStorage.removeItem('naver_token');
    localStorage.removeItem('naver_user');
    localStorage.removeItem('kakao_token');
    localStorage.removeItem('kakao_user');
    localStorage.removeItem('last_login_provider');
    localStorage.removeItem('user');

    setUser(null);

    if (!error) {
      alert('로그아웃되었습니다.');
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        width: 'min(480px, 90%)',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {user ? (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '40px',
              paddingBottom: '20px',
            }}
          >
            <img
              src={user.profile_image || defaultAvatar}
              alt={user.name}
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7snbTrr7jsp4A8L3RleHQ+PC9zdmc+';
              }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #e5e7eb',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h3
                style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {user.name || (user.provider === 'kakao' ? '카카오 사용자' : '사용자')}
              </h3>
              {user.provider && (
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    margin: '0',
                    fontWeight: '400',
                  }}
                >
                  {user.provider === 'kakao' ? '카카오 로그인' : '네이버 로그인'}
                </p>
              )}
              {user.email && (
                <p
                  style={{
                    color: '#9ca3af',
                    fontSize: '0.75rem',
                    margin: '4px 0 0 0',
                  }}
                >
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
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
              opacity: isNaverLoading || isKakaoLoading ? 0.6 : 1,
            }}
          >
            {isNaverLoading ? (
              '로딩 중...'
            ) : (
              <>
                <span className="naver-icon">N</span>
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
              opacity: isNaverLoading || isKakaoLoading ? 0.6 : 1,
            }}
          >
            {isKakaoLoading ? (
              '로딩 중...'
            ) : (
              <>
                <svg className="kakao-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.8 6.7L6 21.5c-.1.4.3.8.7.6l4.5-3c.3 0 .5.1.8.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
                </svg>
                <span>카카오톡 로그인</span>
              </>
            )}
          </button>

          {/* 구분선 */}
          <div className="divider">
            <span>또는</span>
          </div>

          {/* ✅ 에러 메시지 표시 */}
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          {/* ✅ 로그인 폼 - onChange 추가 */}
          <form className="login-form" onSubmit={handleLogin}>
            <Input type="email" name="email" placeholder="이메일" className="input-field" value={formData.email} onChange={handleInputChange} required />
            <Input type="password" name="password" placeholder="비밀번호" className="input-field" value={formData.password} onChange={handleInputChange} required />
            <Button type="submit" className="login-btn bg-[#1e6fd9] submit-btn" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* 하단 링크 */}
          <div className="footer-links">
            <Link to="/find-account">계정 찾기</Link>
            <span className="seperator">|</span>
            <Link to="/find-password">비밀번호 찾기</Link>
            <span className="seperator">|</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
