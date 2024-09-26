import React, { useState, useEffect } from "react";
import { ref, push, onValue } from "firebase/database";
import { dbRealtime } from "./firebaseConfig"; // Firebase 설정 불러오기
import "./Orders.css"; // 필요한 스타일링을 추가

function Orders() {
  const [customerName, setCustomerName] = useState(""); // 예약자명 상태 관리
  const [menuName, setMenuName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태 관리
  const [reservationDateTime, setReservationDateTime] = useState(""); // 예약 날짜와 시간 관리
  const [startDate, setStartDate] = useState(new Date()); // 시작 날짜 관리
  const [orderList, setOrderList] = useState([]); // 주문 목록 상태 관리

  // 날짜를 "YYYY-MM-DD" 형식으로 변환하는 함수 (시간 제거)
  const formatDateToYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 두 자리수로 표시
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 현재 화면에 표시할 날짜의 범위를 구하는 함수 (7일)
  const getDisplayedDates = (start) => {
    const dates = [];
    const currentDate = new Date(start); // 시작 날짜를 기준으로 날짜 리스트 생성
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // 일요일로 시작하도록 설정

    for (let i = 0; i < 7; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // 다음 날짜로 이동
    }

    return dates;
  };

  // 요일 목록
  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

  // 날짜를 "MM/DD" 형식으로 변환하는 함수
  const formatDate = (date) => {
    const day = date.getDate();
    return `${day}`;
  };

  // 선택된 날짜를 "0000년 00월 00일" 형식으로 변환하는 함수
  const formatSelectedDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 1을 더함
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  // 월을 "0000년 00월" 형식으로 변환하는 함수
  const formatMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  // 화살표로 날짜를 한 주씩 이동하는 함수
  const handleDateChange = (direction) => {
    const newStartDate = new Date(startDate);
    newStartDate.setDate(newStartDate.getDate() + direction * 7); // 7일씩 이동
    setStartDate(newStartDate); // 새로운 시작 날짜로 업데이트
  };

  // Firebase에서 주문 목록을 실시간으로 가져오는 함수
  useEffect(() => {
    const ordersRef = ref(dbRealtime, "orders");
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const orders = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setOrderList(orders); // 주문 목록 업데이트
      } else {
        setOrderList([]); // 데이터가 없을 경우 빈 배열
      }
    });
  }, []);

  // Firebase에 주문 저장하는 함수
  const handleOrderSubmit = async () => {
    if (customerName && menuName && quantity && reservationDateTime) {
      const reservationDate = formatDateToYMD(new Date(reservationDateTime)); // 날짜만 저장

      const newOrder = {
        customerName,
        dateTime: reservationDateTime, // 날짜와 시간을 모두 저장
        menuName,
        quantity: Number(quantity),
        date: reservationDate, // YYYY-MM-DD 형식의 날짜만 저장
      };

      try {
        const ordersRef = ref(dbRealtime, "orders"); // Firebase에서 db를 사용해 참조
        await push(ordersRef, newOrder); // Realtime Database에 새로운 데이터 추가
        console.log("Order saved to Firebase Realtime Database");
        setCustomerName("");
        setMenuName("");
        setQuantity("");
        setReservationDateTime("");
      } catch (e) {
        console.error("Error saving order: ", e);
      }
    }
  };

  // 선택한 날짜에 해당하는 주문 목록 필터링 (날짜만 비교)
  const filteredOrders = orderList.filter(
    (order) => order.date === formatDateToYMD(selectedDate)
  );

  return (
    <div>
      <h2>주문 확인 페이지</h2>

      {/* 상단 월 표시 */}
      <div className="month-display">
        <h3>{formatMonth(startDate)}</h3>
      </div>

      {/* 상단 요일 표시 */}
      <div className="day-of-week">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className={`day-label ${index === 0 ? "sunday" : ""} ${
              index === 6 ? "saturday" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 상단 날짜 탭 */}
      <div className="date-tabs-container">
        {/* 좌우 화살표 */}
        <button className="arrow-button" onClick={() => handleDateChange(-1)}>
          &lt;
        </button>
        <div className="date-tabs">
          {getDisplayedDates(startDate).map((date, index) => (
            <div
              key={index}
              className={`date-tab ${
                selectedDate.toDateString() === date.toDateString()
                  ? "selected"
                  : ""
              }`}
              onClick={() => setSelectedDate(date)}
            >
              {formatDate(date)} {/* 날짜만 출력 */}
            </div>
          ))}
        </div>
        <button className="arrow-button" onClick={() => handleDateChange(1)}>
          &gt;
        </button>
      </div>
      {/* 선택된 날짜의 주문 목록 */}
      <div className="order-list">
        <h3>{formatSelectedDate(selectedDate)} 주문 보기 </h3>
        {filteredOrders.length > 0 ? (
          <ul>
            {filteredOrders.map((order) => (
              <li key={order.id}>
                {`${order.customerName} - ${order.dateTime} - ${order.menuName} - ${order.quantity}개`}
              </li>
            ))}
          </ul>
        ) : (
          <p>현재 입력된 주문이 없습니다.</p>
        )}
      </div>

      {/* 주문 입력 기능 */}
      <div className="order-input">
        <h3>주문 입력하기</h3>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="예약자명 입력"
        />
        <input
          type="datetime-local"
          value={reservationDateTime}
          onChange={(e) => setReservationDateTime(e.target.value)}
          placeholder="날짜와 시간 선택"
        />
        <input
          type="text"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          placeholder="메뉴 이름을 입력하세요 (예: 닭다리덮밥)"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="수량을 입력하세요"
        />
        <button onClick={handleOrderSubmit}>주문 입력하기</button>
      </div>
    </div>
  );
}

export default Orders;
