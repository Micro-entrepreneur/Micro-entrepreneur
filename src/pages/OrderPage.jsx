import { useState } from 'react';
import { useNavigate } from 'react-router';
import './OrderPage.css';

const OrderPage = () => {
  const navigate = useNavigate();
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [deliveryRequest, setDeliveryRequest] = useState('배송 전 연락 바랍니다.');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const deliveryOptions = ['배송 전 연락바랍니다.', '문 앞에 놓아주세요.', '직접 받겠습니다.', '경비실에 맡겨주세요.', '택배함에 넣어주세요.'];

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddressChange = () => {
    // 주소 변경 로직
    console.log('주소 변경');
  };

  const handleDeliveryTimeChange = () => {
    // 배송 시간 변경 로직
    console.log('배송 시간 변경');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (option) => {
    setDeliveryRequest(option);
    setIsDropdownOpen(false);
  };
  return (
    <div className="order-page">
      {/* 헤더 */}
      <header className="order-header">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>
      <div className="order-content">
        {/* 배송지 섹션 */}
        <section className="delivery-address">
          <div className="section-header">
            <div className="title-group">
              <span className="location-icon">📍</span>
              <h2 className="delivery-title">배송지</h2>
            </div>
            <button className="change-button" onClick={handleAddressChange}>
              변경
            </button>
          </div>

          <div className="address-info">
            <p className="receiver-name">
              강선이 | <span className="phone-number">010-6700-5980</span>
            </p>
            <p className="address">서울특별시 양천구 신정중앙로6길 15 (한솔맨션) 한솔맨션 302호</p>
          </div>

          <div className="saved-address-option">
            <label htmlFor="" className="checkbox-label">
              <input type="checkbox" checked={useSavedAddress} onChange={(e) => setUseSavedAddress(e.target.checked)} />
              <span>안심번호 사용하기</span>
            </label>
            <span className="info-icon">ℹ️</span>
          </div>
          {/* 배송 요청사항 드롭다운 */}
          <div className="delivery-request-dropdown">
            <button className="dropdown-button" onClick={toggleDropdown}>
              <span>{deliveryRequest}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={isDropdownOpen ? 'rotate' : ''}>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="dropdown-menu">
                {deliveryOptions.map((option, index) => (
                  <li key={index} onClick={() => selectOption(option)} className={deliveryRequest === option ? 'selected' : ''}>
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 상품 배송 섹션 */}
        <section className="product-delivery">
          <h2 className="section-title">상품 배송</h2>

          <div className="delivery-time-card">
            <div className="delivery-time-header">
              <h3 className="delivery-type">당일 배송</h3>
              <button className="change-button" onClick={handleDeliveryTimeChange}>
                변경
              </button>
            </div>
            <p className="delivery-time-info">오늘(12/28) 오후 8~12시 도착</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderPage;
