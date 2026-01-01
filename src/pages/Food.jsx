import { useState, useEffect, useRef } from 'react';
import { searchKakao } from '../api/kakaoApi';
import './Food.css';

function Food() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kakaoMapsLoaded, setKakaoMapsLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infowindowRef = useRef(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('지역명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('검색 시작:', searchTerm);
      const results = await searchKakao(`${searchTerm} 맛집`, {
        display: 15,
        page: 1,
        sort: 'accuracy'
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

  // 카카오 맵 초기화
  useEffect(() => {
    const loadKakaoMaps = async () => {
      // 카카오 맵이 이미 로드되었는지 확인
      if (window.kakao && window.kakao.maps) {
        setKakaoMapsLoaded(true);
        return;
      }

      // KAKAO_CLIENT_ID 가져오기
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/api/config`);
        const data = await response.json();
        const clientId = data.kakaoClientId;

        if (!clientId) {
          console.error('카카오 맵 API 키를 가져올 수 없습니다.');
          return;
        }

        // 카카오 맵 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${clientId}&libraries=services&autoload=false`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            setKakaoMapsLoaded(true);
          });
        };
        document.head.appendChild(script);
      } catch (err) {
        console.error('카카오 맵 로드 오류:', err);
      }
    };

    loadKakaoMaps();
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    if (!kakaoMapsLoaded || !window.kakao || !window.kakao.maps) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      // 기존 지도 제거
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }

      // 기존 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // 인포윈도우 초기화
      if (!infowindowRef.current) {
        infowindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
      }

      // 지도 생성
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3
      };

      mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, mapOption);

      // 검색 결과가 있으면 마커 표시
      if (shops.length > 0) {
        displayMarkers(shops);
      }
    };

    // 약간의 지연을 두고 지도 초기화 (DOM이 완전히 렌더링된 후)
    const timer = setTimeout(initializeMap, 100);
    return () => clearTimeout(timer);
  }, [kakaoMapsLoaded, shops]);

  // 마커 표시 함수
  const displayMarkers = (places) => {
    if (!mapInstanceRef.current || !window.kakao || !window.kakao.maps) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();

    places.forEach((place) => {
      // 좌표 추출 (카카오 로컬 검색 API 응답 형식에 맞춤)
      const lat = parseFloat(place.y || place.latitude);
      const lng = parseFloat(place.x || place.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const position = new window.kakao.maps.LatLng(lat, lng);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        map: mapInstanceRef.current,
        position: position
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', function() {
        const content = `
          <div style="padding:5px;font-size:12px;min-width:150px;">
            <div style="font-weight:bold;margin-bottom:5px;">${place.place_name || place.name || '음식점'}</div>
            ${place.road_address_name ? `<div style="font-size:11px;color:#666;">📍 ${place.road_address_name}</div>` : ''}
            ${place.phone ? `<div style="font-size:11px;color:#666;">📞 ${place.phone}</div>` : ''}
          </div>
        `;
        infowindowRef.current.setContent(content);
        infowindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // 검색된 장소 위치를 기준으로 지도 범위 재설정
    if (places.length > 0) {
      mapInstanceRef.current.setBounds(bounds);
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
        {shops.length > 0 && (
          <div className="map-container">
            <div id="map" ref={mapRef} style={{ width: '100%', height: '400px', borderRadius: '8px', marginBottom: '20px' }}></div>
          </div>
        )}
        
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
