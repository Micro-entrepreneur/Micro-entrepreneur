import { Link } from 'react-router';

const Setting = () => {
  return (
    <div className="relative">
      <ul className="top-full left-0 flex flex-col list-none m-0 p-0 gap-0 bg-white w-full text-center shadow-md rounded-b-lg mt-4 transition-all duration-300 ease-in-out">
        <li className="py-4 border-b border-white/10 h-16 flex justify-center items-center">
          <Link to="/mypage" className="text-black no-underline text-base transition-colors duration-300 block py-6 px-4">
            <span className="mr-2">👤</span>내 정보 수정
          </Link>
        </li>
        <li className="py-4 border-b border-white/10 h-16 flex justify-center items-center">
          <Link to="/contact" className="text-black no-underline text-base transition-colors duration-300 block py-6 px-4">
            <span className="mr-2">💬</span>
            1:1 문의
          </Link>
        </li>
        <li className="py-4 border-b border-white/10 h-16 flex  justify-center items-center">
          <Link to="/faq" className="text-black no-underline text-base transition-colors duration-300 block py-6 px-4">
            <span className="mr-2">📋</span>
            약관 확인
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Setting;
