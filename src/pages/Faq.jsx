const Faq = () => {
  return (
    <section className="faq">
      <h2>음식 소상공인 FAQ</h2>

      <details className="faq-item">
        <summary className="faq-question">
          <span>배달 플랫폼 등록은 어떻게 하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>음식점을 배달 플랫폼에 등록하려면 아래 절차를 따르세요:</p>
          <ol>
            <li>회원가입을 진행하고 사업자 정보를 입력해주세요.</li>
            <li>음식점 정보(상호명, 주소, 전화번호, 영업시간 등)를 등록해주세요.</li>
            <li>메뉴 정보와 가격을 입력해주세요.</li>
            <li>사업자 등록증과 음식점 사진을 업로드해주세요.</li>
            <li>관리자 승인 후 배달 서비스를 시작할 수 있습니다.</li>
          </ol>
          <p>추가 문의사항이 있으시면 고객센터로 연락해주세요.</p>
          <a href="/contact">[고객지원 &gt; 사업자 지원 &gt; 배달 플랫폼 등록]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>수수료는 얼마인가요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>배달 플랫폼 수수료는 다음과 같습니다:</p>
          <ol>
            <li>기본 수수료: 주문 금액의 10-15% (플랫폼별 상이)</li>
            <li>광고 수수료: 선택적 광고 시 추가 수수료 발생</li>
            <li>정산 주기: 주 1회 또는 월 2회 정산 가능</li>
          </ol>
          <p>정확한 수수료율은 플랫폼별로 다를 수 있으며, 가입 시 담당자와 상의하여 결정합니다.</p>
          <a href="/fees">[고객지원 &gt; 사업자 지원 &gt; 수수료 안내]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>정산은 언제 받을 수 있나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>정산 일정은 다음과 같습니다:</p>
          <ol>
            <li>주간 정산: 매주 화요일 전 주 월-일 매출 정산</li>
            <li>월간 정산: 매월 15일, 말일 전월 매출 정산</li>
            <li>정산 방법: 등록하신 계좌로 자동 이체</li>
            <li>정산 지연 시: 고객센터로 문의해주세요</li>
          </ol>
          <p>정산 내역은 사업자 페이지에서 확인하실 수 있습니다.</p>
          <a href="/settlement">[고객지원 &gt; 사업자 지원 &gt; 정산 안내]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>메뉴 등록 및 수정은 어떻게 하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>메뉴 등록 및 수정 방법:</p>
          <ol>
            <li>사업자 페이지 로그인 후 "메뉴 관리" 메뉴 선택</li>
            <li>새 메뉴 추가: "메뉴 추가" 버튼 클릭 후 정보 입력</li>
            <li>메뉴 수정: 수정할 메뉴 클릭 후 변경 사항 저장</li>
            <li>메뉴 삭제: 삭제할 메뉴 선택 후 "삭제" 버튼 클릭</li>
            <li>메뉴 사진: 최대 5장까지 등록 가능, 권장 해상도 800x600px</li>
          </ol>
          <p>메뉴 등록은 실시간으로 반영되며, 고객에게 즉시 노출됩니다.</p>
          <a href="/menu">[고객지원 &gt; 사업자 지원 &gt; 메뉴 관리]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>주문 취소는 어떻게 처리하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>주문 취소 처리 방법:</p>
          <ol>
            <li>주문 접수 전 취소: 고객이 직접 취소 가능, 수수료 없음</li>
            <li>조리 시작 전 취소: 사업자 확인 후 취소 처리, 수수료 환불</li>
            <li>조리 중 취소: 사업자 재량에 따라 취소 처리, 수수료 일부 부담</li>
            <li>배달 출발 후 취소: 취소 불가, 환불 불가</li>
          </ol>
          <p>취소 처리 시 고객에게 알림이 자동으로 전송되며, 정산 시 자동 반영됩니다.</p>
          <a href="/orders">[고객지원 &gt; 사업자 지원 &gt; 주문 관리]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>영업시간 설정은 어떻게 하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>영업시간 설정 방법:</p>
          <ol>
            <li>사업자 페이지 로그인 후 "매장 정보 관리" 선택</li>
            <li>일반 영업시간: 평일/주말/공휴일별 시간 설정</li>
            <li>임시 휴무: 특정 날짜 휴무 설정 가능</li>
            <li>브레이크타임: 점심시간 등 휴식 시간 설정</li>
            <li>마감 임박 알림: 30분 전 자동 주문 마감 설정</li>
          </ol>
          <p>영업시간 외에는 주문 접수가 되지 않으며, 고객에게 영업시간이 안내됩니다.</p>
          <a href="/hours">[고객지원 &gt; 사업자 지원 &gt; 영업시간 관리]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>리뷰 및 평점은 어떻게 관리하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>리뷰 및 평점 관리:</p>
          <ol>
            <li>리뷰 확인: 사업자 페이지에서 모든 리뷰 조회 가능</li>
            <li>리뷰 답변: 각 리뷰에 대해 사업자 답변 작성 가능</li>
            <li>부적절한 리뷰: 신고 기능을 통해 관리자에게 신고 가능</li>
            <li>평점 노출: 최근 30일 평균 평점이 고객에게 노출</li>
            <li>리뷰 이벤트: 좋은 리뷰 작성 고객에게 혜택 제공 가능</li>
          </ol>
          <p>리뷰는 고객 서비스 개선에 중요한 자료이니 적극적으로 활용해주세요.</p>
          <a href="/reviews">[고객지원 &gt; 사업자 지원 &gt; 리뷰 관리]</a>
        </div>
      </details>

      <details className="faq-item">
        <summary className="faq-question">
          <span>광고 등록은 어떻게 하나요?</span>
          <span className="icon" aria-hidden="true"></span>
        </summary>
        <div className="faq-answer">
          <p>광고 등록 방법:</p>
          <ol>
            <li>사업자 페이지에서 "광고 관리" 메뉴 선택</li>
            <li>광고 타입 선택: 배너 광고, 검색 상위 노출, 할인 쿠폰 등</li>
            <li>광고 기간 및 예산 설정</li>
            <li>광고 이미지 및 문구 작성 (플랫폼 가이드라인 준수)</li>
            <li>결제 후 광고 승인 대기 (24시간 이내)</li>
          </ol>
          <p>광고 효과 분석은 실시간으로 확인 가능하며, 성과에 따라 광고 전략을 조정할 수 있습니다.</p>
          <a href="/advertising">[고객지원 &gt; 사업자 지원 &gt; 광고 관리]</a>
        </div>
      </details>
    </section>
  );
};

export default Faq;










