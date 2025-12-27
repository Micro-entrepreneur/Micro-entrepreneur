
import './App.css'

function App() {

  return (
    <body>
      <header>🌱 지역 배달 플랫폼 – 소상공인 응원</header>

    <div className="container">
      <div className="search">
        <input type="text" id="location" placeholder="예: 강서구 음식점" />
        <button id="searchBtn">검색</button>
      </div>

      <ul className="shop-list" id="shopList"></ul>

      <div className="coupon">지역주민 전용 <span>5,000원 할인 쿠폰</span> 🎫</div>
    </div>

    <footer>© 2025 지역경제 살리기 캠페인</footer>
    </body>
  )
}

export default App
