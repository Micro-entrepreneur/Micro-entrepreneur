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

// 서버 상태 확인
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// 카카오 로컬 검색 API (음식점 검색)
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  const display = req.query.display || 10;
  const page = req.query.page || 1;
  const sort = req.query.sort || 'accuracy'; // accuracy: 정확도순, distance: 거리순

  if (!query) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  if (!KAKAO_CLIENT_ID) {
    return res.status(500).json({ 
      error: '카카오 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 KAKAO_CLIENT_ID를 설정해주세요.' 
    });
  }

  try {
    const response = await axios.get(
      'https://dapi.kakao.com/v2/local/search/keyword.json',
      {
        params: {
          query: query,
          size: parseInt(display),
          page: parseInt(page),
          sort: sort,
        },
        headers: {
          'Authorization': `KakaoAK ${KAKAO_CLIENT_ID}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      '카카오 로컬 검색 API 오류:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: 'API 요청 실패',
      message: error.response?.data?.message || error.message,
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
    const tokenResponse = await axios.get(
      'https://nid.naver.com/oauth2.0/token',
      {
        params: {
          grant_type: 'authorization_code',
          client_id: NAVER_CLIENT_ID,
          client_secret: NAVER_CLIENT_SECRET,
          code: code,
          state: state,
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    // 사용자 정보 조회
    const userResponse = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

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
  const redirectUri =
    req.query.redirect_uri || 'http://localhost:5173/api/naver/callback';
  const state = req.query.state || 'random_state_string';

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}`;

  res.json({ authUrl });
});

// 카카오톡 로그인 URL 생성
app.get('/api/kakao/auth-url', (req, res) => {
  const redirectUri =
    req.query.redirect_uri || 'http://localhost:5173/login';
  const state = req.query.state || 'random_state_string';

  if (!KAKAO_CLIENT_ID) {
    return res.status(500).json({ 
      error: '카카오 API 키가 설정되지 않았습니다.',
      message: '.env 파일에 KAKAO_CLIENT_ID를 설정해주세요.' 
    });
  }

  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&state=${state}`;

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
      message: '.env 파일에 KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 설정해주세요.' 
    });
  }

  try {
    // 토큰 발급 (카카오는 POST 방식)
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      qs.stringify({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const access_token = tokenResponse.data.access_token;

    if (!access_token) {
      throw new Error('액세스 토큰을 받지 못했습니다.');
    }

    // 사용자 정보 조회
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        property_keys: JSON.stringify(['kakao_account.profile', 'kakao_account.email']),
      },
    });

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
    
    const errorMessage = error.response?.data?.error_description 
      || error.response?.data?.error 
      || error.response?.data?.msg
      || error.message;
    
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
    console.warn(
      '⚠️  NAVER_CLIENT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.'
    );
  }
  console.log(`카카오 CLIENT_ID: ${KAKAO_CLIENT_ID || '설정되지 않음'}`);
  if (!KAKAO_CLIENT_SECRET) {
    console.warn(
      '⚠️  KAKAO_CLIENT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.'
    );
  }
});
