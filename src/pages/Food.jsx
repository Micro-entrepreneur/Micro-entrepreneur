import { useState } from 'react';
import './Food.css'; // ✅ CSS import

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 공공 API 검색 함수
const searchPublicApi = async (keyword, options = {}) => {
  const { display = 15, page = 1 } = options;

  try {
    const url = `${API_BASE_URL}/api/public/search?query=${encodeURIComponent(keyword)}&display=${display}&page=${page}`;
    console.log('공공 API 검색 요청:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('공공 API 검색 오류:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      let errorMessage = errorData.message || '검색 실패';
      if (errorData.details?.hint) {
        errorMessage += ` (${errorData.details.hint})`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('공공 API 검색 성공:', {
      resultCount: data.documents?.length || 0,
      totalCount: data.meta?.total_count || 0,
    });
    return data;
  } catch (error) {
    console.error('공공 API 검색 오류:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (${API_BASE_URL})`);
    }
    throw error;
  }
};

function Food() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('지역명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('검색 시작:', searchTerm);
      const results = await searchPublicApi(`${searchTerm} 맛집`, {
        display: 15,
        page: 1
      });
      
      console.log('검색 결과:', results);
      console.log('documents:', results.documents);
      console.log('documents 길이:', results.documents?.length);
      
      if (results && results.documents && Array.isArray(results.documents) && results.documents.length > 0) {
        console.log('검색 결과 설정:', results.documents.length, '개');
        setShops(results.documents);
        setError(null);
      } else {
        console.log('검색 결과 없음 또는 빈 배열');
        setShops([]);
        setError('검색 결과가 없습니다. 다른 지역명으로 시도해보세요.');
      }
    } catch (err) {
      console.error('검색 오류:', err);
      console.error('오류 상세:', err.stack);
      setError('검색 중 오류가 발생했습니다: ' + err.message);
      setShops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="food-container">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="지역명을 입력하세요 (예: 강남구)" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? '검색 중...' : '검색'}
        </button>
      </div>

      {isLoading && (
        <div className="message-box">
          <h2>로딩중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      )}

      {error && (
        <div className="message-box error">
          <h2>에러 발생!!</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="content-area">
        {shops.length > 0 ? (
          <ul className="result-list">
            {shops.map((shop, index) => (
              <li key={shop.id || index} className="shop-item">
                <div className="shop-info">
                  <h3>
                    {shop.place_name || '음식점'}
                    {shop.branch_name && (
                      <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal', marginLeft: '8px' }}>
                        ({shop.branch_name})
                      </span>
                    )}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0' }}>
                    {shop.category_name || ''}
                    {shop.middle_category && ` > ${shop.middle_category}`}
                    {shop.small_category && ` > ${shop.small_category}`}
                  </p>
                  {shop.road_address_name && (
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0' }}>
                      📍 도로명: {shop.road_address_name}
                      {shop.building_name && ` (${shop.building_name})`}
                    </p>
                  )}
                  {shop.address_name && (
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0' }}>
                      📍 지번: {shop.address_name}
                    </p>
                  )}
                  {shop.phone && (
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0' }}>
                      📞 {shop.phone}
                    </p>
                  )}
                  {(shop.sigungu || shop.dong) && (
                    <p style={{ fontSize: '0.8rem', color: '#bbb', margin: '4px 0' }}>
                      {shop.sigungu && shop.sigungu}
                      {shop.dong && ` ${shop.dong}`}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && !error && (
            <p className="empty-message">지역명을 입력하고 검색 버튼을 클릭하세요.</p>
          )
        )}
      </div>
    </div>
  );
}

export default Food;
