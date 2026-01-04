# 카카오 로그인 설정 가이드

## 1. .env 파일 설정

프로젝트 루트 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PORT=3001
KAKAO_CLIENT_ID=17fc495b849b38e42037418cd4be5759
KAKAO_CLIENT_SECRET=UdJ5jN4LbKPrYPrEAxBUdVd8Qw4mO8AJ
```

## 2. 카카오 개발자 센터 설정

1. **카카오 개발자 센터 접속**
   - https://developers.kakao.com 접속
   - 카카오 계정으로 로그인

2. **내 애플리케이션 선택**
   - REST API 키: `17fc495b849b38e42037418cd4be5759` 인 애플리케이션 선택

3. **카카오 로그인 활성화**
   - 왼쪽 메뉴: "제품 설정" → "카카오 로그인"
   - "활성화 설정"을 **ON**으로 변경

4. **Redirect URI 등록 (중요!)**
   - "Redirect URI 등록" 섹션에서 "Redirect URI 등록" 클릭
   - 다음 URI를 추가:
     ```
     http://localhost:5173/login
     ```
   - 저장 버튼 클릭

5. **동의 항목 설정 (선택사항)**
   - 필요시 사용자 정보 동의 항목 설정
   - 닉네임, 프로필 사진, 이메일 등

## 3. 서버 재시작

`.env` 파일을 저장한 후 서버를 재시작하세요:

```bash
npm run server
```

또는 프론트엔드와 함께:

```bash
npm run dev:all
```

## 4. 테스트

1. 브라우저에서 `http://localhost:5173/login` 접속
2. "카카오톡 로그인" 버튼 클릭
3. 카카오 로그인 진행
4. 로그인 성공 후 사용자 정보 확인

## 주의사항

⚠️ **Redirect URI가 정확해야 합니다**
- 카카오 개발자 센터에 등록한 Redirect URI와 코드에서 사용하는 URI가 정확히 일치해야 합니다
- 현재 설정: `http://localhost:5173/login`

⚠️ **보안**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- KAKAO_CLIENT_SECRET은 절대 공개하지 마세요












