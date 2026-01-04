import { useState } from 'react';
import { useNavigate } from 'react-router';

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
    console.log('주소 변경');
  };

  const handleDeliveryTimeChange = () => {
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
    <div className="max-w-[600px] mx-auto bg-[#f5f5f5] min-h-[100dvh]">
      {/* 헤더 */}
      <header className="mt-[10px] h-25 relative flex items-center justify-center p-4 bg-white border-b border-gray-200">
        <button className="absolute left-4 bg-transparent border-none p-2 cursor-pointer" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>
      <div className="p-4">
        {/* 배송지 섹션 */}
        <section className="bg-white rounded-xl p-5 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <h2 className="text-lg font-bold text-[#ff6b35] m-0">배송지</h2>
            </div>
            <button className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm cursor-pointer" onClick={handleAddressChange}>
              변경
            </button>
          </div>

          <div className="mb-4">
            <p className="text-base font-semibold mb-2 text-gray-700">
              강선이 | <span className="font-normal">010-6700-5980</span>
            </p>
            <p className="text-sm text-gray-500 leading-normal">서울특별시 양천구 신정중앙로6길 15 (한솔맨션) 한솔맨션 302호</p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="number" className="flex items-center gap-2 cursor-pointer text-sm">
              <input className="w-4 h-5 cursor-pointer" type="checkbox" checked={useSavedAddress} onChange={(e) => setUseSavedAddress(e.target.checked)} />
              <span>안심번호 사용하기</span>
            </label>
            <span className="text-base opacity-50">ℹ️</span>
          </div>

          {/* 배송 요청사항 드롭다운 */}
          <div className="relative">
            <button className="w-full flex justify-between items-center p-4 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer text-left" onClick={toggleDropdown}>
              <span>{deliveryRequest}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={isDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'}>
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-300 rounded-lg list-none p-0 m-0 shadow-lg z-10">
                {deliveryOptions.map((option, index) => (
                  <li key={index} onClick={() => selectOption(option)} className={`p-3 cursor-pointer hover:bg-gray-50 ${deliveryRequest === option ? 'bg-blue-50 text-blue-600' : ''}`}>
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 상품 배송 섹션 */}
        <section className="bg-white rounded-xl p-5">
          <h2 className="text-base font-bold mb-4 m-0">상품 배송</h2>

          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold m-0">당일 배송</h3>
              <button className="py-1.5 px-4 bg-white border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50" onClick={handleDeliveryTimeChange}>
                변경
              </button>
            </div>
            <p className="text-sm text-blue-500 m-0">오늘(12/28) 오후 8~12시 도착</p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-5 mt-4">
          <h2 className="text-base font-bold mb-4 m-0">할인 혜택</h2>
          <div className="border border-gray-300 rounded-lg p-4">
            <p>사용 가능한 쿠폰이 없습니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrderPage;
