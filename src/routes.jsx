import { createBrowserRouter, Outlet } from 'react-router-dom';
import ShopSearch from './pages/ShopSearch';
import Login from './pages/Login';
import Header from './components/Header';
import Faq from '@/pages/Faq';
import Register from '@/pages/Register';
import MyPage from '@/pages/MyPage';

export const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <footer>© 2025 지역경제 살리기 캠페인</footer>
    </>
  );
};

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <ShopSearch /> },
      { path: '/login', element: <Login /> },
      { path: '/faq', element: <Faq /> },
      { path: '/signup', element: <Register /> },
      { path: '/mypage', element: <MyPage /> },
    ],
  },
]);

export default router;
