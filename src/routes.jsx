import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Faq from '@/pages/Faq';
import Register from '@/pages/Register';
import MyPage from '@/pages/MyPage';
import StarRating from '@/pages/StarRating';
import Food from '@/pages/Food';
import Layout from '@/components/layout/global-layout';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Food /> },
      { path: '/login', element: <Login /> },
      { path: '/faq', element: <Faq /> },
      { path: '/signup', element: <Register /> },
      { path: '/mypage', element: <MyPage /> },
      { path: '/starrating', element: <StarRating /> },
    ],
  },
]);

export default router;
