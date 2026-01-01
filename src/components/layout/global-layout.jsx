import { Outlet } from 'react-router';

const GlobalLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <footer>© 2025 지역경제 살리기 캠페인</footer>
    </>
  );
};

export default GlobalLayout;
