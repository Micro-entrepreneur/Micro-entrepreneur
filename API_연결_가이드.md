# 네이버 & 카카오 API 백엔드 연결 가이드

이 문서는 네이버와 카카오 API를 백엔드 서버에 연결하는 방법을 설명합니다.

## 1. .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하세요.

## 2. 네이버 API 연결

### 2.1 네이버 개발자 센터에서 애플리케이션 등록

1. **네이버 개발자 센터 접속**
   - https://developers.naver.com 접속
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - 상단 메뉴에서 "Application" → "애플리케이션 등록" 클릭
   - 애플리케이션 이름: 원하는 이름 입력 (예: "FoodApp")
   - 사용 API: **네이버 로그인** 선택
   - 로그인 오픈 API 서비스 환경: **PC 웹** 선택
   - 서비스 URL: `http://localhost:5173`
   - Callback URL: `http://localhost:5173/login` (또는 사용하는 로그인 페이지 경로)

3. **API 키 확인**
   - 애플리케이션 등록 후 "Client ID"와 "Client Secret" 복사

### 2.2 .env 파일에 네이버 API 키 추가

`.env` 파일에 다음 내용을 추가하세요:

```env
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
```

**예시:**
```env
NAVER_CLIENT_ID=iYM5MsOWdmcf4dEDS01B
NAVER_CLIENT_SECRET=abc123def456ghi789
```

## 3. 카카오 API 연결

### 3.1 카카오 개발자 센터에서 애플리케이션 등록

1. **카카오 개발자 센터 접속**
   - https://developers.kakao.com 접속
   - 카카오 계정으로 로그인

2. **애플리케이션 만들기**
   - 상단 메뉴에서 "내 애플리케이션" → "애플리케이션 추가하기" 클릭
   - 앱 이름: 원하는 이름 입력 (예: "FoodApp")
   - 사업자명: 개인인 경우 본인 이름 입력

3. **카카오 로그인 활성화**
   - 생성한 애플리케이션 클릭
   - 왼쪽 메뉴에서 "제품 설정" → "카카오 로그인" 클릭
   - "활성화 설정"을 **ON**으로 변경

4. **Redirect URI 등록**
   - "Redirect URI 등록" 섹션에서 "Redirect URI 등록" 클릭
   - Redirect URI 입력: `http://localhost:5173/login` (또는 사용하는 로그인 페이지 경로)
   - 저장

5. **동의 항목 설정 (선택사항)**
   - 필요시 사용자 정보 동의 항목 설정 (이메일, 프로필 등)

6. **API 키 확인**
   - "앱 설정" → "앱 키" 메뉴에서
   - **REST API 키** 복사 (Client ID로 사용)
   - "보안" 메뉴에서 **Client Secret** 생성 및 복사

### 3.2 .env 파일에 카카오 API 키 추가

`.env` 파일에 다음 내용을 추가하세요:

```env
KAKAO_CLIENT_ID=발급받은_REST_API_키
KAKAO_CLIENT_SECRET=발급받은_Client_Secret
```

**예시:**
```env
KAKAO_CLIENT_ID=1234567890abcdef1234567890abcdef
KAKAO_CLIENT_SECRET=xyz789abc123def456ghi789jkl012
```

## 4. 전체 .env 파일 예시

최종 `.env` 파일은 다음과 같아야 합니다:

```env
# 서버 포트
PORT=3001

# 네이버 API
NAVER_CLIENT_ID=iYM5MsOWdmcf4dEDS01B
NAVER_CLIENT_SECRET=your_naver_client_secret_here

# 카카오 API
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
```

## 5. 서버 재시작

.env 파일을 수정한 후에는 **서버를 재시작**해야 변경사항이 적용됩니다.

```bash
# 서버 중지 (Ctrl + C)
# 서버 재시작
npm run server

# 또는 프론트엔드와 함께 실행
npm run dev:all
```

## 6. 확인 방법

### 6.1 서버 콘솔 확인

서버 실행 시 콘솔에 다음과 같이 표시되어야 합니다:

```
서버가 포트 3001에서 실행 중입니다.
네이버 CLIENT_ID: iYM5MsOWdmcf4dEDS01B
카카오 CLIENT_ID: 1234567890...
```

⚠️ 경고 메시지가 나타나면 API 키가 제대로 설정되지 않은 것입니다.

### 6.2 API 테스트

- 브라우저에서 `http://localhost:3001/api/health` 접속
- 정상 응답: `{"status":"ok","timestamp":"...","port":3001}`

## 7. 주의사항

⚠️ **중요: 보안**
- `.env` 파일은 절대 Git에 커밋하지 마세요 (이미 .gitignore에 포함됨)
- Client Secret은 절대 공개하지 마세요
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요

⚠️ **개발 환경 설정**
- Redirect URI는 로컬 개발용 (`http://localhost:5173/login`)
- 프로덕션 배포 시 실제 도메인으로 변경해야 합니다

## 8. 문제 해결

### 네이버 로그인 오류
- Redirect URI가 개발자 센터에 등록된 값과 정확히 일치하는지 확인
- Client ID와 Client Secret이 올바른지 확인
- 서버 콘솔에서 오류 메시지 확인

### 카카오 로그인 오류
- 카카오 로그인이 활성화되어 있는지 확인
- Redirect URI가 정확히 등록되었는지 확인
- Client Secret이 생성되었는지 확인

## 9. 추가 리소스

- 네이버 개발자 센터: https://developers.naver.com
- 카카오 개발자 센터: https://developers.kakao.com
- 네이버 로그인 API 문서: https://developers.naver.com/docs/login/overview
- 카카오 로그인 API 문서: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api










