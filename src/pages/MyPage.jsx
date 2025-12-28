import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const loadUser = async () => {
      try {
        // Supabase 세션 확인
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
            email: session.user.email,
            profile_image: '',
            provider: 'email',
          });
          setLoading(false);
          return;
        }

        // localStorage에서 사용자 정보 확인 (네이버/카카오 로그인)
        const lastProvider = localStorage.getItem('last_login_provider') || 'naver';
        const savedUser = localStorage.getItem(`${lastProvider}_user`);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (e) {
            console.error('사용자 정보 파싱 오류:', e);
          }
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    // Supabase 로그아웃
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase 로그아웃 오류:', error);
    }

    // 모든 provider의 토큰과 사용자 정보 제거
    localStorage.removeItem('naver_token');
    localStorage.removeItem('naver_user');
    localStorage.removeItem('kakao_token');
    localStorage.removeItem('kakao_user');
    localStorage.removeItem('last_login_provider');
    localStorage.removeItem('user');

    setUser(null);
    alert('로그아웃되었습니다.');
    navigate('/login');
  };

  if (loading) {
    return (
      <div
        style={{
          width: 'min(480px, 90%)',
          margin: '50px auto',
          padding: '30px',
          textAlign: 'center',
        }}
      >
        <p>로딩 중...</p>
      </div>
    );
  }

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
              src={
                user.profile_image ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7snbTrr7jsp4A8L3RleHQ+PC9zdmc+'
              }
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
                {user.name || (user.provider === 'kakao' ? '카카오 사용자' : user.provider === 'email' ? '이메일 사용자' : '네이버 사용자')}
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
                  {user.provider === 'kakao' ? '카카오 로그인' : user.provider === 'email' ? '이메일 로그인' : '네이버 로그인'}
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
              marginTop: '20px',
            }}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px' }}>로그인이 필요합니다.</p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#1e6fd9',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          >
            로그인하기
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPage;
