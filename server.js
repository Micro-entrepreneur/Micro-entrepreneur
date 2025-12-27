/* eslint-env node */
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정
app.use(cors());
app.use(express.json());

// 네이버 API 설정
const CLIENT_ID = process.env.NAVER_CLIENT_ID || 'iYM5MsOWdmcf4dEDS01B';
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';

// 네이버 검색 API
app.get('/api/search', async (req, res) => {
  const query = req.query.query;
  const display = req.query.display || 10;
  const start = req.query.start || 1;
  const sort = req.query.sort || 'sim';

  if (!query) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  try {
    const response = await axios.get(
      'https://openapi.naver.com/v1/search/blog.json',
      {
        params: {
          query: query,
          display: parseInt(display),
          start: parseInt(start),
          sort: sort,
        },
        headers: {
          'X-Naver-Client-Id': CLIENT_ID,
          'X-Naver-Client-Secret': CLIENT_SECRET,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      '네이버 검색 API 오류:',
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: 'API 요청 실패',
      message: error.response?.data?.errorMessage || error.message,
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
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
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

  const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}`;

  res.json({ authUrl });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`네이버 CLIENT_ID: ${CLIENT_ID}`);
  if (!CLIENT_SECRET) {
    console.warn(
      '⚠️  NAVER_CLIENT_SECRET이 설정되지 않았습니다. .env 파일을 확인해주세요.'
    );
  }
});
