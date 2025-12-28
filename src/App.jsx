import { RouterProvider } from 'react-router';
import './App.css';
import ShopSearch from './components/ShopSearch';
import router from './routes';

function App() {
  return (
    <>
      <header>🌱 지역 배달 플랫폼 – 소상공인 응원</header>
      <RouterProvider router={router} />
      <footer>© 2025 지역경제 살리기 캠페인</footer>
    </>
  );
}

export default App;
