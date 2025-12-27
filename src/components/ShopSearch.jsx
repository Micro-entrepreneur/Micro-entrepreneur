import { useState } from 'react';

const ShopSearch = () => {
  // 🔑 카카오 REST API 키
  const REST_API_KEY = '678249840108c6653982c43bce2ae27c';

  const [location, setLocation] = useState('');
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const headers = { Authorization: `KakaoAK ${REST_API_KEY}` };

  // API 키 확인
  const checkApiKey = () => {
    if (
      !REST_API_KEY ||
      REST_API_KEY === '여기에_본인_카카오_REST_API_KEY_입력'
    ) {
      console.error('❌ 카카오 REST API 키가 설정되지 않았습니다!');
      alert(
        '카카오 REST API 키를 설정해주세요!\n\n1. https://developers.kakao.com 접속\n2. 내 애플리케이션 > 앱 키 > REST API 키 복사\n3. 코드의 REST_API_KEY 변수에 입력'
      );
      return false;
    }
    return true;
  };

  async function searchPlaces(keyword) {
    try {
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        keyword
      )}`;
      console.log('🔍 검색 요청:', keyword);

      const res = await fetch(url, { headers });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ API 오류:', errorData);

        if (res.status === 401) {
          alert('인증 오류: 카카오 REST API 키를 확인해주세요!');
        } else if (res.status === 403) {
          // 403 오류: 서비스 비활성화
          const errorMsg = errorData.message || '';
          if (
            errorMsg.includes('OPEN_MAP_AND_LOCAL') ||
            errorMsg.includes('로컬')
          ) {
            alert(
              '⚠️ 로컬 서비스가 비활성화되어 있습니다!\n\n' +
                '카카오 개발자 콘솔에서 활성화해주세요:\n\n' +
                '1. https://developers.kakao.com 접속\n' +
                '2. 내 애플리케이션 > "소상공인 음식앱" 선택\n' +
                '3. 앱 설정 > 플랫폼 설정\n' +
                '4. "로컬" 서비스 활성화\n' +
                '5. 저장 후 다시 시도해주세요'
            );
          } else {
            alert(`접근 권한 오류 (403): ${errorMsg}`);
          }
        } else if (res.status === 400) {
          alert('잘못된 요청입니다. 검색어를 확인해주세요.');
        } else {
          alert(
            `API 오류 발생 (${res.status}): ${
              errorData.message || '알 수 없는 오류'
            }`
          );
        }
        return [];
      }

      const data = await res.json();
      console.log('✅ 검색 결과:', data);

      if (!data.documents) {
        console.warn('⚠️ documents가 없습니다:', data);
        return [];
      }

      return data.documents;
    } catch (error) {
      console.error('❌ 네트워크 오류:', error);
      alert('검색 중 오류가 발생했습니다: ' + error.message);
      return [];
    }
  }

  // 이미지 URL 생성 함수
  function getShopImage(shop) {
    // 카테고리별 음식 이미지 (Unsplash 사용)
    const category = (shop.category_group_name || '').toLowerCase();
    const categoryImages = {
      카페: 'https://images.unsplash.com/photo-1501339847302-ac426a14c129?w=70&h=70&fit=crop&q=80',
      치킨: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=70&h=70&fit=crop&q=80',
      피자: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=70&h=70&fit=crop&q=80',
      중국: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=70&h=70&fit=crop&q=80',
      일식: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=70&h=70&fit=crop&q=80',
      한식: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=70&h=70&fit=crop&q=80',
      양식: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=70&h=70&fit=crop&q=80',
      분식: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=70&h=70&fit=crop&q=80',
      음식점:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=70&h=70&fit=crop&q=80',
    };

    // 카테고리명에서 키워드 매칭
    let imageUrl = categoryImages['음식점']; // 기본값

    // 카테고리명에 포함된 키워드로 이미지 찾기
    for (const [key, url] of Object.entries(categoryImages)) {
      if (category.includes(key)) {
        imageUrl = url;
        break;
      }
    }

    return imageUrl;
  }

  const handleSearch = async () => {
    const keyword = location.trim();
    if (!keyword) {
      alert('검색어를 입력해주세요!');
      return;
    }

    // API 키 확인
    if (!checkApiKey()) {
      return;
    }

    // 로딩 표시
    setIsLoading(true);
    setShops([]);

    const results = await searchPlaces(keyword);
    setShops(results);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 대체 이미지 (SVG 이모지)
  const fallbackImage = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70"><rect width="70" height="70" fill="#f8f9fa" rx="8"/><text x="50%" y="50%" font-size="35" text-anchor="middle" dominant-baseline="central">🍽️</text></svg>`
  )}`;

  return (
    <div className='container'>
      <div className='search'>
        <input
          type='text'
          id='location'
          placeholder='예: 강서구 음식점'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button id='searchBtn' onClick={handleSearch}>
          검색
        </button>
      </div>

      <ul className='shop-list' id='shopList'>
        {isLoading ? (
          <li style={{ textAlign: 'center', padding: '20px' }}>검색 중...</li>
        ) : shops.length === 0 ? (
          <li style={{ textAlign: 'center', padding: '20px' }}>
            검색 결과가 없습니다 😢
          </li>
        ) : (
          shops.map((shop, index) => {
            const imageUrl = getShopImage(shop);
            return (
              <li key={shop.place_id || shop.id || index} className='shop-item'>
                <img
                  src={imageUrl}
                  alt={shop.place_name}
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                  style={{ background: '#f8f9fa', objectFit: 'cover' }}
                />
                <div className='shop-info'>
                  <h3>{shop.place_name}</h3>
                  <p>
                    {shop.category_group_name || '음식점'} · {shop.address_name}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className='coupon'>
        지역주민 전용 <span>5,000원 할인 쿠폰</span> 🎫
      </div>
    </div>
  );
};

export default ShopSearch;
