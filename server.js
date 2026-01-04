/* eslint-env node */
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 정적 파일 서빙 설정
app.use(express.static(__dirname));

// CORS 설정
app.use(cors());
app.use(express.json()); // JSON 파싱을 위해 추가

// 로그인 상태 유지를 위한 세션 설정
app.use(
  session({
    secret: 'your session secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// 네이버 API 설정
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || 'iYM5MsOWdmcf4dEDS01B';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';

// 카카오톡 API 설정
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '';
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || '';

// 공공 API 설정
const PUBLIC_API_KEY = process.env.PUBLIC_API_KEY || 'b0439d73407d26dac75e4d5f7f3669ea98ed6c0abe72e74ddb8386ba9b9a6fe9';

// 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// 프론트엔드 설정 정보 제공 (카카오 맵 등에서 사용)
app.get('/api/config', (req, res) => {
  res.json({
    kakaoClientId: KAKAO_CLIENT_ID || '',
  });
});

// 행정경계조회 API (baroApi) - 지역 정보 조회
app.get('/api/public/baroApi', async (req, res) => {
  const query = req.query.query; // 검색어 (시도명, 시군구명, 행정동명 등)
  const numOfRows = parseInt(req.query.numOfRows) || 10;
  const pageNo = parseInt(req.query.pageNo) || 1;

  if (!query) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  if (!PUBLIC_API_KEY) {
    return res.status(500).json({
      error: '공공 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 PUBLIC_API_KEY를 설정해주세요.',
    });
  }

  try {
    const API_BASE_URL = process.env.PUBLIC_API_URL || 'https://apis.data.go.kr/B553077/api/open/sdsc2';

    const params = new URLSearchParams();
    params.append('serviceKey', PUBLIC_API_KEY);
    params.append('numOfRows', numOfRows.toString());
    params.append('pageNo', pageNo.toString());
    params.append('resultType', 'json');
    params.append('key', query); // 검색어

    const apiUrl = `${API_BASE_URL}/baroApi?${params.toString()}`;

    console.log('행정경계조회 API 호출:', apiUrl.substring(0, 200) + '...');

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
      responseType: 'text',
    });

    // 응답 형식 확인
    const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const trimmedText = responseText.trim();

    // HTML 응답인지 확인
    if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
      console.error('HTML 오류 페이지 반환:', trimmedText.substring(0, 500));
      throw new Error('API가 HTML 오류 페이지를 반환했습니다.');
    }

    // XML 응답인지 확인
    if (trimmedText.startsWith('<?xml') || trimmedText.startsWith('<response') || trimmedText.startsWith('<result')) {
      console.error('XML 응답 반환 (baroApi):', trimmedText.substring(0, 500));

      // XML 오류 메시지 추출
      let errorMsg = '행정경계조회 API가 XML 형식으로 응답했습니다. resultType=json 파라미터가 적용되지 않았습니다.';

      const errorMatch = trimmedText.match(/<message>([^<]+)<\/message>/i) || trimmedText.match(/<resultMsg>([^<]+)<\/resultMsg>/i);

      if (errorMatch) {
        errorMsg += ` (${errorMatch[1]})`;
      }

      throw new Error(errorMsg);
    }

    // JSON 파싱
    let responseData;
    try {
      responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('JSON 파싱 실패 (baroApi):', parseError.message);
      console.error('응답 데이터 (처음 500자):', trimmedText.substring(0, 500));
      throw new Error(`응답 데이터 파싱 실패: ${parseError.message}`);
    }

    // baroApi 응답 형식 처리
    let items = [];
    if (responseData.body?.items) {
      const itemsData = responseData.body.items;
      if (itemsData.item) {
        items = Array.isArray(itemsData.item) ? itemsData.item : [itemsData.item].filter(Boolean);
      }
    } else if (responseData.items) {
      items = Array.isArray(responseData.items.item) ? responseData.items.item : [responseData.items.item].filter(Boolean);
    } else if (Array.isArray(responseData)) {
      items = responseData;
    }

    res.json({
      resultCode: responseData.resultCode || responseData.body?.resultCode || '00',
      resultMsg: responseData.resultMsg || responseData.body?.resultMsg || '정상',
      items: items,
      totalCount: items.length,
    });
  } catch (error) {
    console.error('행정경계조회 API 오류:', error.message);
    res.status(500).json({
      error: 'API 요청 실패',
      message: error.message,
    });
  }
});

// 공공 API 음식점 검색
app.get('/api/public/search', async (req, res) => {
  const query = req.query.query;
  const display = parseInt(req.query.display) || 10;
  const page = parseInt(req.query.page) || 1;
  const numOfRows = display;
  const pageNo = page;

  if (!query) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  if (!PUBLIC_API_KEY) {
    return res.status(500).json({
      error: '공공 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 PUBLIC_API_KEY를 설정해주세요.',
    });
  }

  try {
    console.log('공공 API 검색 요청:', {
      query,
      display,
      page,
      numOfRows,
      pageNo,
      apiKey: PUBLIC_API_KEY.substring(0, 20) + '...',
    });

    // 공공데이터포털 API 호출
    // 표준시장진흥원 상권정보 서비스 API
    const API_BASE_URL = process.env.PUBLIC_API_URL || 'https://apis.data.go.kr/B553077/api/open/sdsc2';

    // 1단계: 검색어로 행정경계조회 API 호출하여 지역 코드 조회
    let adongCd = null; // 행정동코드
    let adongNm = null; // 행정동명

    try {
      const baroParams = new URLSearchParams();
      baroParams.append('serviceKey', PUBLIC_API_KEY);
      baroParams.append('numOfRows', '10');
      baroParams.append('pageNo', '1');
      baroParams.append('resultType', 'json');
      baroParams.append('key', query);

      const baroApiUrl = `${API_BASE_URL}/baroApi?${baroParams.toString()}`;
      console.log('행정경계조회 API 호출:', baroApiUrl.substring(0, 200) + '...');

      const baroResponse = await axios.get(baroApiUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
        responseType: 'text',
      });

      const baroResponseText = typeof baroResponse.data === 'string' ? baroResponse.data : JSON.stringify(baroResponse.data);
      if (!baroResponseText.trim().startsWith('<!DOCTYPE') && !baroResponseText.trim().startsWith('<html')) {
        const baroData = typeof baroResponse.data === 'string' ? JSON.parse(baroResponse.data) : baroResponse.data;

        // baroApi 응답에서 행정동 정보 추출
        let baroItems = [];
        if (baroData.body?.items?.item) {
          baroItems = Array.isArray(baroData.body.items.item) ? baroData.body.items.item : [baroData.body.items.item].filter(Boolean);
        } else if (baroData.items?.item) {
          baroItems = Array.isArray(baroData.items.item) ? baroData.items.item : [baroData.items.item].filter(Boolean);
        }

        if (baroItems.length > 0) {
          // 첫 번째 결과 사용
          adongCd = baroItems[0].adongCd || baroItems[0].행정동코드;
          adongNm = baroItems[0].adongNm || baroItems[0].행정동명;
          console.log('행정경계조회 성공:', { adongCd, adongNm });
        }
      }
    } catch (baroError) {
      console.log('행정경계조회 실패, 직접 검색 시도:', baroError.message);
    }

    // 2단계: 음식점 검색
    // 공공데이터포털 표준시장진흥원 상권정보 서비스 API
    // 실제 API 엔드포인트는 다를 수 있으므로 여러 방법 시도

    // 방법 1: 행정동 코드로 검색 (우선순위)
    let endpoint = null;
    let searchParams = {};

    if (adongCd) {
      // 행정동 코드로 검색
      endpoint = 'storeListInDong';
      searchParams = {
        divId: 'dongCd',
        key: adongCd,
        indsLclsCd: 'I', // 음식점만
      };
    } else if (query.includes('동') || query.includes('구') || query.includes('시')) {
      // 행정동명으로 검색
      endpoint = 'storeListInDong';
      searchParams = {
        divId: 'dongNm',
        key: query,
        indsLclsCd: 'I', // 음식점만
      };
    } else {
      // 기본: 업종별 검색
      endpoint = 'storeListInUpjong';
      searchParams = {
        indsLclsCd: 'I', // 음식점
      };
    }

    // 엔드포인트가 쿼리 파라미터로 지정된 경우
    if (req.query.endpoint) {
      endpoint = req.query.endpoint;

      // 반경 검색인 경우
      if (endpoint === 'storeListInRadius') {
        const radius = req.query.radius || '1000';
        const cx = req.query.cx || '';
        const cy = req.query.cy || '';

        if (cx && cy) {
          searchParams = {
            cx: cx,
            cy: cy,
            radius: radius,
            indsLclsCd: 'I',
          };
        } else {
          // 좌표가 없으면 행정동 검색으로 변경
          endpoint = 'storeListInDong';
          if (adongCd) {
            searchParams = { divId: 'dongCd', key: adongCd, indsLclsCd: 'I' };
          } else {
            searchParams = { divId: 'dongNm', key: query, indsLclsCd: 'I' };
          }
        }
      } else if (endpoint === 'storeListInArea') {
        searchParams = {
          divId: 'trarNm',
          key: query,
          indsLclsCd: 'I',
        };
      }
    }

    // 기본 파라미터 구성
    const baseParams = {
      serviceKey: PUBLIC_API_KEY,
      numOfRows: numOfRows,
      pageNo: pageNo,
      resultType: 'json',
    };

    // storeListInArea 파라미터 추가 설정
    if (endpoint === 'storeListInArea' && searchParams && !searchParams.divId) {
      searchParams.divId = 'trarNm'; // 상권명으로 검색
      searchParams.indsLclsCd = 'I'; // 음식점만
    }

    // storeListInRadius 파라미터 검증
    if (endpoint === 'storeListInRadius') {
      if (!searchParams.cx || !searchParams.cy) {
        console.warn('storeListInRadius는 cx(경도)와 cy(위도) 파라미터가 필요합니다.');
      }
    }

    // API URL 구성
    // 공공데이터포털 API는 serviceKey를 인코딩하지 않고 그대로 전달해야 할 수도 있음
    // URLSearchParams는 자동으로 인코딩하지만, 일부 API는 원본 키를 요구함
    const params = new URLSearchParams();

    // baseParams 추가 (serviceKey는 인코딩하지 않고 추가)
    params.append('serviceKey', PUBLIC_API_KEY);
    params.append('numOfRows', numOfRows.toString());
    params.append('pageNo', pageNo.toString());
    params.append('resultType', 'json');

    // searchParams 추가
    for (const [key, value] of Object.entries(searchParams)) {
      params.append(key, value.toString());
    }

    const apiUrl = `${API_BASE_URL}/${endpoint}?${params.toString()}`;

    let response;
    let responseData;
    try {
      response = await axios.get(apiUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500,
        responseType: 'text',
        headers: {
          Accept: 'application/json',
        },
      });

      // 응답 형식 확인
      const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      const trimmedText = responseText.trim();

      // HTML 응답인지 확인
      if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html')) {
        console.error('HTML 오류 페이지 반환:', trimmedText.substring(0, 500));
        throw new Error('API가 HTML 오류 페이지를 반환했습니다. API 파라미터를 확인해주세요.');
      }

      // XML 응답인지 확인
      if (trimmedText.startsWith('<?xml') || trimmedText.startsWith('<response') || trimmedText.startsWith('<result')) {
        console.error('XML 응답 반환:', trimmedText.substring(0, 500));
        console.error('전체 XML 응답:', trimmedText);

        // XML에서 오류 메시지 추출 시도
        let errorMsg = 'API가 XML 형식으로 응답했습니다. resultType=json 파라미터가 적용되지 않았습니다.';

        // XML 오류 메시지 추출
        const errorMatch = trimmedText.match(/<message>([^<]+)<\/message>/i) || trimmedText.match(/<resultMsg>([^<]+)<\/resultMsg>/i) || trimmedText.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/i);

        if (errorMatch) {
          errorMsg += ` (${errorMatch[1]})`;
        }

        // serviceKey 문제인지 확인
        const returnReasonCodeMatch = trimmedText.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/i);
        if (returnReasonCodeMatch) {
          const reasonCode = returnReasonCodeMatch[1];
          if (reasonCode.includes('SERVICE_KEY') || reasonCode.includes('인증키')) {
            errorMsg = 'API 인증키(serviceKey)가 올바르지 않거나 인코딩이 필요합니다. .env 파일의 PUBLIC_API_KEY를 확인해주세요.';
          }
        }

        throw new Error(errorMsg);
      }

      // JSON 파싱 시도
      try {
        response.data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } catch (parseError) {
        console.error('JSON 파싱 실패:', parseError.message);
        console.error('응답 데이터 (처음 500자):', trimmedText.substring(0, 500));

        // XML인데 파싱 실패한 경우
        if (trimmedText.includes('<') && trimmedText.includes('>')) {
          throw new Error('API가 XML 형식으로 응답했습니다. 공공데이터포털 API 설정에서 resultType=json 파라미터가 제대로 전달되지 않았거나, API가 JSON을 지원하지 않을 수 있습니다.');
        }

        throw new Error(`응답 데이터 파싱 실패: ${parseError.message}`);
      }

      console.log('공공 API 호출 성공');

      // 응답 데이터 (이미 파싱됨)
      responseData = response.data;

      console.log('공공 API 응답:', {
        status: response.status,
        contentType: response.headers['content-type'],
        hasData: !!responseData,
        dataKeys: responseData ? Object.keys(responseData) : [],
        dataPreview: JSON.stringify(responseData).substring(0, 500),
      });

      // 공공 API 응답 형식 변환 (표준시장진흥원 API 형식 처리)
      let items = [];
      let totalCount = 0;

      console.log('공공 API 응답 구조:', {
        hasResponse: !!responseData.response,
        hasBody: !!responseData.response?.body,
        hasItems: !!responseData.response?.body?.items,
        responseKeys: responseData ? Object.keys(responseData) : [],
        bodyKeys: responseData.response?.body ? Object.keys(responseData.response.body) : [],
      });

      // 공공 API 응답 형식 처리 (표준시장진흥원 API)
      // storeListInArea 응답 구조: body.items.item 배열 또는 직접 배열
      // 응답 구조 확인
      console.log('응답 데이터 구조 분석:', {
        hasBody: !!responseData.body,
        hasItems: !!responseData.body?.items,
        hasItem: !!responseData.body?.items?.item,
        hasResponse: !!responseData.response,
        isArray: Array.isArray(responseData),
        directKeys: responseData ? Object.keys(responseData) : [],
      });

      if (responseData.body?.items) {
        // 일반적인 공공 API 응답 형식: body.items.item
        const itemsData = responseData.body.items;
        if (itemsData.item) {
          items = Array.isArray(itemsData.item) ? itemsData.item : [itemsData.item].filter(Boolean);
        } else if (Array.isArray(itemsData)) {
          // body.items가 직접 배열인 경우
          items = itemsData;
        }
        totalCount = parseInt(responseData.body.totalCount || responseData.body.totalCount || '0') || items.length;
      } else if (responseData.response?.body?.items) {
        // response.body.items 형식
        const itemsData = responseData.response.body.items;
        if (itemsData.item) {
          items = Array.isArray(itemsData.item) ? itemsData.item : [itemsData.item].filter(Boolean);
        } else if (Array.isArray(itemsData)) {
          items = itemsData;
        }
        totalCount = parseInt(responseData.response.body.totalCount || '0') || items.length;
      } else if (responseData.items) {
        // 직접 items 속성
        if (responseData.items.item) {
          items = Array.isArray(responseData.items.item) ? responseData.items.item : [responseData.items.item].filter(Boolean);
        } else if (Array.isArray(responseData.items)) {
          items = responseData.items;
        }
        totalCount = parseInt(responseData.totalCount || '0') || items.length;
      } else if (Array.isArray(responseData)) {
        // 응답이 직접 배열인 경우
        items = responseData;
        totalCount = responseData.length;
      } else if (responseData.bizesId) {
        // 단일 객체인 경우
        items = [responseData];
        totalCount = 1;
      } else {
        console.warn('예상하지 못한 응답 형식:', responseData);
        console.log('전체 응답 데이터:', JSON.stringify(responseData, null, 2).substring(0, 1000));
        items = [];
        totalCount = 0;
      }

      console.log('추출된 항목 수:', items.length, '전체 개수:', totalCount);

      // 공공 API 응답을 통일된 형식으로 변환
      // storeOne 응답 구조 기반 (storeListInDong, storeListInUpjong 등도 동일한 필드명 사용)
      const transformedData = {
        documents: items.map((item, index) => ({
          id: item.bizesId || item.bizesNm || item.SEQ || index,
          place_name: item.bizesNm || item.상호명 || item.업소명 || '음식점',
          branch_name: item.brchNm || item.지점명 || '',
          category_name: item.indsLclsNm || item.업종대분류명 || '음식점',
          category_code: item.indsLclsCd || '',
          middle_category: item.indsMclsNm || item.업종중분류명 || '',
          middle_category_code: item.indsMclsCd || '',
          small_category: item.indsSclsNm || item.업종소분류명 || '',
          small_category_code: item.indsSclsCd || '',
          // 주소 정보
          address_name: item.lnoAdr || item.지번주소 || item.지번기준전체주소 || '',
          road_address_name: item.rdnmAdr || item.도로명주소 || item.도로명전체주소 || '',
          road_name: item.rdnm || item.도로명 || '',
          building_name: item.bldNm || item.건물명 || '',
          building_number: item.bldMnno || item.건물본번지 || '',
          building_sub_number: item.bldSlno || item.건물부번지 || '',
          // 연락처 및 기타
          phone: item.telno || item.전화번호 || '',
          zipcode: item.newZipcd || item.신우편번호 || item.oldZipcd || item.구우편번호 || '',
          // 좌표 정보
          mapx: item.lon || item.X || item.경도 || '',
          mapy: item.lat || item.Y || item.위도 || '',
          // 지역 정보
          province: item.ctprvnNm || item.시도명 || '',
          province_code: item.ctprvnCd || '',
          sigungu: item.signguNm || item.시군구명 || '',
          sigungu_code: item.signguCd || '',
          dong: item.adongNm || item.행정동명 || '',
          dong_code: item.adongCd || '',
          legal_dong: item.ldongNm || item.법정동명 || '',
          legal_dong_code: item.ldongCd || '',
          // 건물 정보
          floor: item.flrNo || item.층정보 || '',
          ho: item.hoNo || item.호정보 || '',
          dong_no: item.dongNo || item.동정보 || '',
          // 업종 상세
          ksic_code: item.ksicCd || '',
          ksic_name: item.ksicNm || '',
        })),
        meta: {
          total_count: totalCount,
          pageable_count: items.length,
          is_end: page * numOfRows >= totalCount,
          stdr_ym: responseData.body?.stdrYm || responseData.stdrYm || '',
          num_of_rows: responseData.body?.numOfRows || responseData.numOfRows || numOfRows,
          page_no: responseData.body?.pageNo || responseData.pageNo || pageNo,
          result_code: responseData.body?.resultCode || responseData.resultCode || '',
          result_msg: responseData.body?.resultMsg || responseData.resultMsg || '',
        },
      };

      console.log('공공 API 검색 성공:', {
        resultCount: transformedData.documents.length,
        totalCount: transformedData.meta.total_count,
      });

      res.json(transformedData);
    } catch (error) {
      console.error('공공 API 호출 오류:', {
        message: error.message,
        endpoint,
        apiUrl: apiUrl.substring(0, 200),
      });

      // 에러를 상위 catch 블록으로 전달
      throw error;
    }
  } catch (error) {
    console.error('공공 API 검색 오류:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
    });

    let errorMessage = '검색 중 오류가 발생했습니다.';
    let errorDetails = {};

    // XML/HTML 응답 처리
    if (error.response?.data && typeof error.response.data === 'string') {
      const responseText = error.response.data.trim();

      // HTML 오류 응답 처리
      if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
        errorMessage = 'API가 HTML 오류 페이지를 반환했습니다. API 엔드포인트나 파라미터를 확인해주세요.';
        errorDetails = {
          hint: '공공데이터포털 API 문서를 확인하여 올바른 엔드포인트와 파라미터를 사용하세요.',
          apiBaseUrl: `https://apis.data.go.kr/B553077/api/open/sdsc2`,
          currentUrl: apiUrl ? apiUrl.substring(0, 200) : 'N/A',
          commonIssues: ['API 엔드포인트 경로가 올바른지 확인 (서비스 메서드명 포함 여부)', '필수 파라미터가 모두 포함되었는지 확인', '인증키(serviceKey)가 올바른지 확인', 'API 서비스가 활성화되어 있는지 확인', 'resultType=json 파라미터가 포함되었는지 확인'],
          note: '공공데이터포털 API는 보통 {baseUrl}/{serviceMethod} 형식입니다. 예: /getStorList, /getTrdarStorList 등',
        };
      }
      // XML 응답 처리
      else if (responseText.startsWith('<?xml') || responseText.startsWith('<response') || responseText.startsWith('<result')) {
        errorMessage = 'API가 XML 형식으로 응답했습니다.';

        // XML에서 오류 메시지 추출 (여러 형식 시도)
        const errorMatch =
          responseText.match(/<message>([^<]+)<\/message>/i) || responseText.match(/<resultMsg>([^<]+)<\/resultMsg>/i) || responseText.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/i) || responseText.match(/<msg>([^<]+)<\/msg>/i) || responseText.match(/<errorMsg>([^<]+)<\/errorMsg>/i);

        if (errorMatch) {
          const xmlErrorMsg = errorMatch[1];
          errorMessage = `API 오류: ${xmlErrorMsg}`;

          // INVALID_REQUEST_PARAMETER_ERROR 특별 처리
          if (xmlErrorMsg.includes('INVALID_REQUEST_PARAMETER_ERROR') || xmlErrorMsg.includes('파라미터')) {
            errorMessage = 'API 요청 파라미터가 잘못되었습니다. 엔드포인트나 파라미터를 확인해주세요.';
            errorDetails = {
              hint: '공공데이터포털 API의 실제 엔드포인트 구조가 다를 수 있습니다. API 문서를 확인하거나, 다른 검색 API(카카오/네이버)를 사용해보세요.',
              xmlError: xmlErrorMsg,
              suggestion: '개발 환경에서는 테스트 데이터를 사용하거나, 카카오 로컬 검색 API로 전환을 고려해보세요.',
              xmlResponse: responseText.substring(0, 1000),
            };
          } else {
            errorMessage = `API 오류: ${xmlErrorMsg}`;
            errorDetails = {
              xmlError: xmlErrorMsg,
              xmlResponse: responseText.substring(0, 500),
            };
          }
        } else {
          errorMessage = 'API가 XML 형식으로 응답했습니다. resultType=json 파라미터가 적용되지 않았거나, API가 JSON을 지원하지 않습니다.';
          errorDetails = {
            hint: '공공데이터포털 API가 XML을 반환했습니다. API 문서에서 JSON 응답 지원 여부와 올바른 엔드포인트 경로를 확인하세요.',
            xmlResponse: responseText.substring(0, 1000),
          };
        }

        // serviceKey 문제 확인
        const returnReasonCodeMatch = responseText.match(/<returnReasonCode>([^<]+)<\/returnReasonCode>/i);
        if (returnReasonCodeMatch) {
          const reasonCode = returnReasonCodeMatch[1];
          if (reasonCode.includes('SERVICE_KEY') || reasonCode.includes('인증키')) {
            errorMessage = 'API 인증키(serviceKey)가 올바르지 않습니다. .env 파일의 PUBLIC_API_KEY를 확인해주세요.';
          }
        }
      }
    } else if (error.response?.data?.response?.header?.resultMsg) {
      errorMessage = error.response.data.response.header.resultMsg;
      errorDetails = error.response.data;
    } else if (error.response?.data?.RESULT?.MESSAGE) {
      errorMessage = error.response.data.RESULT.MESSAGE;
      errorDetails = error.response.data;
    } else if (error.response?.data) {
      errorMessage = error.response.data.message || error.message;
      errorDetails = error.response.data;
    } else {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        hint: '공공 API 엔드포인트가 올바른지 확인해주세요. .env 파일의 PUBLIC_API_KEY와 API 엔드포인트를 확인하세요.',
      };
    }

    // 개발 환경에서 테스트 데이터 반환 옵션
    if (process.env.NODE_ENV !== 'production' && (errorMessage.includes('INVALID_REQUEST_PARAMETER') || errorMessage.includes('XML') || errorMessage.includes('파라미터'))) {
      console.warn('개발 모드: 공공 API 호출 실패로 테스트 데이터를 반환합니다.');
      console.warn('실제 API를 사용하려면 공공데이터포털 API 문서를 확인하여 올바른 엔드포인트를 설정하세요.');

      return res.status(200).json({
        documents: [
          {
            id: 1,
            place_name: `${query} 맛집 1 (테스트 데이터)`,
            branch_name: '',
            category_name: '음식점 > 한식 > 백반',
            address_name: '서울특별시 강남구 테헤란로 123',
            road_address_name: '서울특별시 강남구 테헤란로 123',
            phone: '02-1234-5678',
            sigungu: '강남구',
            dong: '역삼동',
            mapx: '127.0276',
            mapy: '37.4979',
            description: '공공 API 연결 실패로 인한 테스트 데이터입니다. 실제 API를 사용하려면 API 엔드포인트와 파라미터를 확인하세요.',
          },
          {
            id: 2,
            place_name: `${query} 맛집 2 (테스트 데이터)`,
            branch_name: '',
            category_name: '음식점 > 카페 > 베이커리',
            address_name: '서울특별시 강남구 테헤란로 456',
            road_address_name: '서울특별시 강남구 테헤란로 456',
            phone: '02-9876-5432',
            sigungu: '강남구',
            dong: '삼성동',
            mapx: '127.0456',
            mapy: '37.5079',
            description: '공공 API 연결 실패로 인한 테스트 데이터입니다.',
          },
        ],
        meta: {
          total_count: 2,
          pageable_count: 2,
          is_end: true,
          resultCode: 'TEST_DATA',
          resultMsg: '공공 API 호출 실패로 테스트 데이터 반환 (개발 모드)',
          note: '실제 API를 사용하려면 공공데이터포털 API 문서를 확인하여 올바른 엔드포인트와 파라미터를 설정하세요.',
        },
      });
    }

    res.status(error.response?.status || 500).json({
      error: 'API 요청 실패',
      message: errorMessage,
      details: errorDetails,
    });
  }
});

// 음식점 검색 API (카카오 로컬 검색)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1;
    const display = parseInt(req.query.display) || 10;

    if (!query) {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    if (!KAKAO_CLIENT_ID) {
      return res.status(500).json({
        error: '카카오 API 키가 설정되지 않았습니다.',
        message: '.env 파일에 KAKAO_CLIENT_ID를 설정해주세요.',
      });
    }

    const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
      params: {
        query: query,
        size: display,
        page: page,
        sort: 'accuracy', // 정확도순
      },
      headers: {
        Authorization: `KakaoAK ${KAKAO_CLIENT_ID}`,
      },
    });

    if (!response.data) {
      throw new Error('검색 실패');
    }

    const data = response.data;
    console.log('검색 결과:', {
      query,
      resultCount: data.documents?.length || 0,
      totalCount: data.meta?.total_count || 0,
    });

    // 카카오 API 응답을 그대로 반환 (documents와 meta 형식이 이미 일치함)
    res.json({
      documents: data.documents || [],
      meta: {
        total_count: data.meta?.total_count || 0,
        pageable_count: data.meta?.pageable_count || 0,
        is_end: data.meta?.is_end || false,
        page: data.meta?.page || page,
      },
    });
  } catch (error) {
    console.error('검색 오류:', error.message);

    let statusCode = 500;
    let errorMessage = '검색 중 오류가 발생했습니다.';

    if (error.response?.status === 401) {
      statusCode = 401;
      errorMessage = '카카오 API 키가 유효하지 않습니다. KAKAO_CLIENT_ID를 확인해주세요.';
    } else if (error.response?.status === 400) {
      statusCode = 400;
      errorMessage = error.response?.data?.msg || '잘못된 요청입니다.';
    } else if (error.response?.data?.msg) {
      errorMessage = error.response.data.msg;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      error: '검색 실패',
      message: errorMessage,
    });
  }
});

// 네이버 로그인 콜백
app.get('/api/naver/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;

  if (!code) {
    return res.status(400).json({ error: '인증 코드가 없습니다.' });
  }

  try {
    // 토큰 발급
    const tokenResponse = await axios.get('https://nid.naver.com/oauth2.0/token', {
      params: {
        grant_type: 'authorization_code',
        client_id: NAVER_CLIENT_ID,
        client_secret: NAVER_CLIENT_SECRET,
        code: code,
        state: state,
      },
    });

    const access_token = tokenResponse.data.access_token;

    // 사용자 정보 조회
    const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    res.json({
      success: true,
      token: access_token,
      user: userResponse.data.response,
    });
  } catch (error) {
    console.error('네이버 로그인 오류:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: '로그인 실패',
      message: error.response?.data?.error_description || error.message,
    });
  }
});

// 네이버 로그인 URL 생성
app.get('/api/naver/auth-url', (req, res) => {
  const redirectUri = req.query.redirect_uri || 'http://localhost:5173/api/naver/callback';
  const state = req.query.state || 'random_state_string';

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  res.json({ authUrl });
});

// 카카오톡 로그인 URL 생성
app.get('/api/kakao/auth-url', (req, res) => {
  const redirectUri = req.query.redirect_uri || 'http://localhost:5173/login';
  const state = req.query.state || 'random_state_string';

  if (!KAKAO_CLIENT_ID) {
    return res.status(500).json({
      error: '카카오 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 KAKAO_CLIENT_ID를 설정해주세요.',
    });
  }

  console.log('카카오 로그인 URL 생성:', {
    redirectUri,
    client_id: KAKAO_CLIENT_ID?.substring(0, 10) + '...',
  });

  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

  res.json({ authUrl });
});

// 카카오톡 로그인 콜백
app.get('/api/kakao/callback', async (req, res) => {
  const code = req.query.code;
  const redirectUri = req.query.redirect_uri || 'http://localhost:5173/login';

  if (!code) {
    return res.status(400).json({ error: '인증 코드가 없습니다.' });
  }

  if (!KAKAO_CLIENT_ID || !KAKAO_CLIENT_SECRET) {
    return res.status(500).json({
      error: '카카오 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 설정해주세요.',
    });
  }

  try {
    console.log('카카오 로그인 콜백 요청:', {
      code: code.substring(0, 20) + '...',
      redirectUri,
      client_id: KAKAO_CLIENT_ID?.substring(0, 10) + '...',
    });

    // 토큰 발급 (카카오는 POST 방식)
    const tokenData = {
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      client_secret: KAKAO_CLIENT_SECRET,
      code: code,
      redirect_uri: redirectUri,
    };

    console.log('카카오 토큰 요청 데이터:', {
      ...tokenData,
      client_secret: '***',
      code: code.substring(0, 20) + '...',
    });

    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', qs.stringify(tokenData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const access_token = tokenResponse.data.access_token;

    if (!access_token) {
      throw new Error('액세스 토큰을 받지 못했습니다.');
    }

    // 사용자 정보 조회
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    console.log('카카오 사용자 정보 응답:', JSON.stringify(userResponse.data, null, 2));

    const kakaoAccount = userResponse.data.kakao_account || {};
    const profile = kakaoAccount.profile || {};

    // 카카오 사용자 정보를 네이버와 유사한 형식으로 변환
    const user = {
      id: userResponse.data.id,
      name: profile.nickname || kakaoAccount.name || '카카오 사용자',
      email: kakaoAccount.email || '',
      profile_image: profile.profile_image_url || profile.thumbnail_image_url || '',
      provider: 'kakao',
    };

    console.log('변환된 사용자 정보:', user);

    res.json({
      success: true,
      token: access_token,
      user: user,
    });
  } catch (error) {
    console.error('카카오톡 로그인 오류:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });

    const errorMessage = error.response?.data?.error_description || error.response?.data?.error || error.response?.data?.msg || error.message;

    res.status(error.response?.status || 500).json({
      error: '로그인 실패',
      message: errorMessage,
      details: error.response?.data,
    });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`네이버 CLIENT_ID: ${NAVER_CLIENT_ID}`);
  if (!NAVER_CLIENT_SECRET) {
    console.warn('⚠️  NAVER_CLIENT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
  console.log(`카카오 CLIENT_ID: ${KAKAO_CLIENT_ID || '설정되지 않음'}`);
  if (!KAKAO_CLIENT_SECRET) {
    console.warn('⚠️  KAKAO_CLIENT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.');
  }
});
