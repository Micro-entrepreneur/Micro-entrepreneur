// 공공 API 호출 함수들

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 공공 API 음식점 검색
export const searchPublicApi = async (keyword, options = {}) => {
  const { display = 10, page = 1 } = options;

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
    console.log('공공 API 검색 응답:', data);
    console.log('공공 API 검색 성공:', {
      resultCount: data.documents?.length || 0,
      totalCount: data.meta?.total_count || 0,
      hasDocuments: !!data.documents,
      isArray: Array.isArray(data.documents),
      dataKeys: Object.keys(data),
    });
    
    // 응답 데이터가 없거나 잘못된 형식인 경우 처리
    if (!data) {
      console.warn('응답 데이터가 없습니다');
      return { documents: [], meta: { total_count: 0, pageable_count: 0, is_end: true } };
    }
    
    // documents가 없으면 빈 배열로 초기화
    if (!data.documents) {
      console.warn('documents 속성이 없습니다. 응답 데이터:', data);
      return { documents: [], meta: data.meta || { total_count: 0, pageable_count: 0, is_end: true } };
    }
    
    return data;
  } catch (error) {
    console.error('공공 API 검색 오류:', error);
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요. (${API_BASE_URL})`);
    }
    throw error;
  }
};

