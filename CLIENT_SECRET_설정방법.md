# 네이버 CLIENT_SECRET 설정 방법

## 1단계: 네이버 개발자 센터 접속
1. https://developers.naver.com 접속
2. 네이버 계정으로 로그인

## 2단계: 애플리케이션 등록/확인
1. 상단 메뉴에서 "Application" → "내 애플리케이션" 클릭
2. 기존 애플리케이션이 있다면 선택, 없다면 "애플리케이션 등록" 클릭

## 3단계: CLIENT_SECRET 확인
1. 애플리케이션을 선택하면 상세 페이지가 열립니다
2. "Client ID" 옆에 "Client Secret" 버튼이 있습니다
3. "Client Secret" 버튼을 클릭하면 Secret 키가 표시됩니다
4. 이 키를 복사하세요

## 4단계: .env 파일에 입력
1. 프로젝트 루트 폴더의 `.env` 파일을 엽니다
2. `NAVER_CLIENT_SECRET=` 뒤에 복사한 Secret 키를 붙여넣습니다
   ```
   NAVER_CLIENT_SECRET=여기에_복사한_Secret_키_붙여넣기
   ```
3. 파일을 저장합니다

## 5단계: 서버 재시작
- 서버를 재시작하면 새로운 CLIENT_SECRET이 적용됩니다

## 주의사항
- CLIENT_SECRET은 절대 공개하지 마세요
- GitHub 등에 업로드할 때는 .env 파일이 .gitignore에 포함되어 있는지 확인하세요
- Secret 키를 잃어버리면 네이버 개발자 센터에서 재발급받을 수 있습니다

