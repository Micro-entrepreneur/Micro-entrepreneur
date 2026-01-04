import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultAvatar from '/img/login/default-avatar.jpg';
import { supabase } from '@/lib/supabase';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 체크
  const checkLoginStatus = async () => {
    try {
      // Supabase 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '사용자',
          email: session.user.email,
          profile_image: session.user.user_metadata?.avatar_url || defaultAvatar,
          provider: 'email',
        });
        setIsLoggedIn(true);
        return;
      }

      // localStorage에서 사용자 정보 확인 (네이버/카카오)
      const lastProvider = localStorage.getItem('last_login_provider');
      if (lastProvider) {
        const token = localStorage.getItem(`${lastProvider}_token`);
        const savedUser = localStorage.getItem(`${lastProvider}_user`);

        if (token && savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setIsLoggedIn(true);
            return;
          } catch (e) {
            console.error('사용자 정보 파싱 오류:', e);
          }
        }
      }

      // 이메일 로그인 확인
      const emailUser = localStorage.getItem('user');
      if (emailUser) {
        try {
          const userData = JSON.parse(emailUser);
          setUser({
            name: userData.user_metadata?.name || userData.email?.split('@')[0] || '사용자',
            email: userData.email,
            profile_image: '',
            provider: 'email',
          });
          setIsLoggedIn(true);
          return;
        } catch (e) {
          console.error('이메일 사용자 정보 파싱 오류:', e);
        }
      }

      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    // 초기 로그인 상태 체크
    checkLoginStatus();

    // storage 이벤트 리스너
    const handleStorageChange = (e) => {
      if (e.key?.includes('_token') || e.key?.includes('_user') || e.key === 'last_login_provider' || e.key === 'user') {
        checkLoginStatus();
      }
    };

    // 커스텀 이벤트 리스너
    const handleLoginStateChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginStateChanged', handleLoginStateChange);

    // cleanup 함수
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStateChanged', handleLoginStateChange);
    };
  }, []);

  // 프로필 이미지 URL
  const profileImageUrl = user?.profile_image;

  // 로그인 페이지로 이동
  const handleLoginClick = () => {
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const closeMenu = () => {
    setIsActive(false);
  };

  return (
    <nav className="nav-container">
      <div className="nav-header-wrapper">
        <header>
          <Link to="/">🌱 지역 배달 플랫폼 – 소상공인 응원</Link>
        </header>
        {isLoggedIn ? (
          <div className="login-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/mypage" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={profileImageUrl}
                alt="프로필 이미지"
                className="profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #fff',
                  cursor: 'pointer',
                }}
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7snbTrr7jsp4A8L3RleHQ+PC9zdmc+';
                }}
              />
            </Link>
          </div>
        ) : (
          <div className="login-b">
            <button
              onClick={handleLoginClick}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fff',
                color: '#1e6fd9',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              시작하기
            </button>
          </div>
        )}
        <button className={`nav-toggler ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu-icon lucide-menu">
            <path d="M4 5h16" />
            <path d="M4 12h16" />
            <path d="M4 19h16" />
          </svg>
        </button>
      </div>

      <ul className={`nav-menu ${isActive ? 'active' : ''}`}>
        <li className="nav-item">
          <Link to="/mypage" className="nav-link" onClick={closeMenu}>
            <span style={{ marginRight: '8px' }}>👤</span>내 정보 수정
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/contact" className="nav-link" onClick={closeMenu}>
            <span style={{ marginRight: '8px' }}>💬</span>
            1:1 문의
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/faq" className="nav-link" onClick={closeMenu}>
            <span style={{ marginRight: '8px' }}>📋</span>
            약관 확인
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Header;
