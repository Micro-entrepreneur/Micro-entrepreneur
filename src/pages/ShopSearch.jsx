import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchPublicApi } from '../api/publicApi';

const ShopSearch = () => {
  const [location, setLocation] = useState('');
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('위치를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('검색 시작:', location);
      const results = await searchPublicApi(`${location} 맛집`, {
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
    <div className="container">
      <div className="search">
        <input
          type="text"
          placeholder="지역명을 입력하세요 (예: 강남구)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? '검색 중...' : '검색'}
        </Button>
      </div>

      {error && (
        <div style={{ padding: '16px', color: '#dc3545', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <ul className="shop-list">
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

      {shops.length === 0 && !isLoading && !error && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          지역명을 입력하고 검색 버튼을 클릭하세요.
        </div>
      )}
    </div>
  );
};

export default ShopSearch;



