# 네이버 API 사용 가이드

## 설정 방법

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   - `.env` 파일을 생성하고 다음 내용을 추가하세요:
   ```
   NAVER_CLIENT_ID=iYM5MsOWdmcf4dEDS01B
   NAVER_CLIENT_SECRET=your_client_secret_here
   PORT=3001
   ```
   - 네이버 개발자 센터에서 CLIENT_SECRET을 발급받아 입력하세요.

3. **서버 실행**
   ```bash
   # 백엔드 서버만 실행
   npm run server

   # 프론트엔드와 백엔드 동시 실행
   npm run dev:all
   ```

## 사용 방법

### 1. 네이버 검색 API

```javascript
import { searchNaver } from './api/naverApi';

// 검색 실행
const results = await searchNaver('맛집', {
  display: 10,  // 결과 개수
  start: 1,     // 시작 위치
  sort: 'sim'   // 정렬 방식 (sim: 정확도, date: 날짜순)
});

console.log(results.items); // 검색 결과
```

### 2. 네이버 로그인

Login 페이지(`/src/pages/Login.jsx`)에서 네이버 로그인 버튼을 클릭하면 자동으로 로그인 프로세스가 진행됩니다.

로그인 후 사용자 정보는 `localStorage`에 저장됩니다:
- `naver_token`: 액세스 토큰
- `naver_user`: 사용자 정보

### 3. 네이버 로그인 URL 생성

```javascript
import { getNaverAuthUrl } from './api/naverApi';

const authUrl = await getNaverAuthUrl(
  'http://localhost:5173/login',  // 리다이렉트 URI
  'random_state_string'            // 상태값
);

window.location.href = authUrl;
```

## API 엔드포인트

### 검색 API
- `GET /api/search?query={검색어}&display={개수}&start={시작위치}&sort={정렬}`

### 로그인 API
- `GET /api/naver/auth-url?redirect_uri={리다이렉트URI}&state={상태값}` - 로그인 URL 생성
- `GET /api/naver/callback?code={인증코드}&state={상태값}` - 로그인 콜백 처리

## 네이버 개발자 센터 설정

1. https://developers.naver.com 접속
2. 애플리케이션 등록
3. 서비스 URL 설정:
   - 서비스 URL: `http://localhost:5173`
   - Callback URL: `http://localhost:5173/login` (또는 사용하는 경로)
4. Client ID와 Client Secret 복사하여 `.env` 파일에 입력

## 주의사항

- CLIENT_SECRET은 절대 공개하지 마세요.
- `.env` 파일은 `.gitignore`에 포함되어 있습니다.
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.

