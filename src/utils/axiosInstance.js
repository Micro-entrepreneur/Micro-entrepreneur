// 참고 소스: https://github.com/FEBC-15/js/blob/main/workspace-ins/ch09/ex09-todolist/yong/utils.ts
// 참고 자료: https://github.com/FEBC-15/js/blob/main/docs/09.js_ajax.md#64-axios-인스턴스
import axios from 'axios';

const API_SERVER = 'https://apis.data.go.kr/B553077/api/open/sdsc2/storeZoneOne?serviceKey=b0439d73407d26dac75e4d5f7f3669ea98ed6c0abe72e74ddb8386ba9b9a6fe9';

export function getAxiosInstance() {
  //TODO 1: axios instance를 생성해서 반환하는 getInstance() 함수 작성
  const instance = axios.create({
    baseURL: API_SERVER, // 기본 URL
    timeout: 1000 * 5,
    headers: {
      'Content-Type': 'application/json', // 요청 바디의 데이터 타입
      // 설정하지 않으면 크롬일 경우 "application/json, text/plain, */*"
      Accept: 'application/json', // 응답 바디의 데이터 타입이 json이면 좋겠음
    },
  });

  // 요청 인터셉터 추가하기
  instance.interceptors.request.use(
    (config) => {
      console.log('요청 인터셉터 호출', config);
      // 요청이 전달되기 전에 필요한 공통 작업 수행
      config.params = {
        // delay: 3000,
        ...config.params, // 기존 쿼리스트링 복사
      };
      return config;
    },
    (error) => {
      // 공통 에러 처리

      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 추가하기
  instance.interceptors.response.use(
    (response) => {
      console.log('정상 응답 인터셉터 호출', response);
      // 2xx 범위에 있는 상태 코드는 이 함수가 호출됨
      // 응답 데이터를 이용해서 필요한 공통 작업 수행
      // if(response.data.ok !== undefined){
      //   response.data.ok = !!response.data.ok; // 숫자 1을 true로, 0을 false로 변환
      // }
      return response;
    },
    (error) => {
      console.error('에러 응답 인터셉터 호출', error);
      // 2xx 외의 범위에 있는 상태 코드는 이 함수가 호출됨
      // 공통 에러 처리

      return Promise.reject(new Error('잠시 후 다시 이용해 주시기 바랍니다.'));
    }
  );

  return instance;
}
