import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchKakao } from '../api/kakaoApi';

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
      const results = await searchKakao(`${location} 맛집`, {
        display: 15,
        sort: 'accuracy'
      });
      
      if (results.documents && results.documents.length > 0) {
        setShops(results.documents);
      } else {
        setShops([]);
        setError('검색 결과가 없습니다.');
      }
    } catch (err) {
      console.error('검색 오류:', err);
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
              <h3>{shop.place_name || '음식점'}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0' }}>
                {shop.category_name || ''}
              </p>
              {shop.address_name && (
                <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0' }}>
                  📍 {shop.address_name}
                  {shop.road_address_name && ` (${shop.road_address_name})`}
                </p>
              )}
              {shop.phone && (
                <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0' }}>
                  📞 {shop.phone}
                </p>
              )}
              {shop.place_url && (
                <a 
                  href={shop.place_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.85rem', color: '#4a90e2', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}
                >
                  자세히 보기 →
                </a>
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



