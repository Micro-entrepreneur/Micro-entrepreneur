import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = () => {
    setIsActive(!isActive);
  };

  const closeMenu = () => {
    setIsActive(false);
  };

  return (
    <nav className="nav-container">
      <div className="nav-header-wrapper">
        <header>🌱 지역 배달 플랫폼 – 소상공인 응원</header>
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
