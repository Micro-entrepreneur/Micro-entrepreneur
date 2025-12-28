import { createBrowserRouter } from 'react-router';
import ShopSearch from './components/ShopSearch';
import Login from './pages/Login';

const router = createBrowserRouter([
  { path: "/", element: <ShopSearch />},
  { path: "/login", element:<Login />}
]);

export default router;