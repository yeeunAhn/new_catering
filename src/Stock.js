import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { dbFirestore, dbRealtime } from "./firebaseConfig";

function Stock() {
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 날짜 상태 관리
  const [filteredOrders, setFilteredOrders] = useState([]); // 선택한 날짜의 주문들
  const [ingredients, setIngredients] = useState([]); // Firestore에서 가져온 재료 정보
  const [orderQuantity, setOrderQuantity] = useState(0); // 선택된 주문 수량

  // Firestore에서 메뉴 정보를 가져와 재료 리스트를 합치는 함수
  const fetchFirestoreMenu = async (menuName, quantity) => {
    try {
      const docRef = doc(dbFirestore, "menus", menuName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedIngredients = Object.keys(docSnap.data().ingredients).map(
          (key) => ({
            name: key,
            unit: docSnap.data().ingredients[key].unit,
            amount: docSnap.data().ingredients[key].amount * quantity, // 주문 수량에 따라 계산된 값
            basicStock: "", // 기본재고 입력용
            currentStock: "", // 현재고 입력용
            purchase: 0, // 사입 계산용
          })
        );

        setIngredients((prevIngredients) => {
          const updatedIngredients = { ...prevIngredients };

          fetchedIngredients.forEach((newIngredient) => {
            if (updatedIngredients[newIngredient.name]) {
              // 이미 존재하는 재료일 경우 양만 추가
              updatedIngredients[newIngredient.name].amount +=
                newIngredient.amount;
            } else {
              // 새 재료일 경우 추가
              updatedIngredients[newIngredient.name] = newIngredient;
            }
          });

          return updatedIngredients;
        });
      } else {
        console.log(
          `Firestore에 ${menuName} 메뉴 정보가 없습니다. 다음 주문으로 넘어갑니다.`
        );
      }
    } catch (error) {
      console.error("Firestore에서 메뉴 정보를 가져오는 중 오류 발생:", error);
    }
  };

  // Realtime Database에서 특정 날짜의 주문 데이터를 가져오는 함수
  useEffect(() => {
    const ordersRef = ref(dbRealtime, "orders");
    const formattedDate = `${selectedDate.getFullYear()}-${(
      selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${selectedDate.getDate().toString().padStart(2, "0")}`; // 날짜를 "YYYY-MM-DD" 형식으로 변환

    const dateQuery = query(
      ordersRef,
      orderByChild("date"),
      equalTo(formattedDate)
    ); // 선택된 날짜로 쿼리

    onValue(dateQuery, (snapshot) => {
      const data = snapshot.val();
      console.log("선택된 날짜의 주문 데이터:", data);

      if (data) {
        const orders = Object.values(data);
        setFilteredOrders(orders); // 선택한 날짜의 모든 주문 저장

        // 기존 재료 목록 초기화
        setIngredients({}); // 이전 재료 정보 초기화

        // 모든 주문에 대해 Firestore에서 재료 데이터를 가져오기
        orders.forEach((order) => {
          fetchFirestoreMenu(order.menuName, order.quantity); // 각 주문의 메뉴에 맞는 재료를 불러오기
        });
      } else {
        console.log("해당 날짜에 대한 주문을 찾지 못했습니다.");
        setFilteredOrders([]); // 해당 날짜에 주문이 없을 경우 빈 배열로 설정
        setIngredients({}); // 재료 정보 초기화
      }
    });
  }, [selectedDate]);

  // 사용자가 입력한 기본재고 및 현재고 값을 업데이트하고 사입 계산
  const handleStockChange = (ingredientName, field, value) => {
    setIngredients((prevIngredients) => {
      const updatedIngredients = { ...prevIngredients };

      // 필드에 따라 값을 업데이트
      if (field === "basicStock") {
        updatedIngredients[ingredientName].basicStock = value;
      } else if (field === "currentStock") {
        updatedIngredients[ingredientName].currentStock = value;
      }

      // 사입 계산: 기본재고 - 현재고 + 주문 수량
      updatedIngredients[ingredientName].purchase =
        updatedIngredients[ingredientName].basicStock -
        updatedIngredients[ingredientName].currentStock +
        updatedIngredients[ingredientName].amount;

      return updatedIngredients;
    });
  };

  // 현재 화면에 표시할 날짜의 범위를 구하는 함수 (7일)
  const getDisplayedDates = (start) => {
    const dates = [];
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // 일요일로 시작

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
    return `${date.getDate()}`;
  };

  // 월을 "0000년 00월" 형식으로 변환하는 함수
  const formatMonth = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 선택된 날짜를 "0000년 00월 00일" 형식으로 변환하는 함수
  const formatSelectedDate = (date) => {
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 화살표로 날짜를 한 주씩 이동하는 함수
  const handleDateChange = (direction) => {
    const newStartDate = new Date(selectedDate);
    newStartDate.setDate(newStartDate.getDate() + direction * 7); // 7일씩 이동
    setSelectedDate(newStartDate); // 새로운 시작 날짜로 업데이트
  };

  // 객체로 저장된 ingredients를 순서대로 배열로 변환하여 출력
  const ingredientArray = Object.values(ingredients);

  return (
    <div className="App">
      <h2>재료 확인 페이지</h2>

      {/* 상단 월 표시 */}
      <div className="month-display">
        <h3>{formatMonth(selectedDate)}</h3>
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
          {getDisplayedDates(selectedDate).map((date, index) => (
            <div
              key={index}
              className={`date-tab ${
                selectedDate.toDateString() === date.toDateString()
                  ? "selected"
                  : ""
              }`}
              onClick={() => setSelectedDate(date)} // 날짜 클릭 시
            >
              {formatDate(date)}
            </div>
          ))}
        </div>
        <button className="arrow-button" onClick={() => handleDateChange(1)}>
          &gt;
        </button>
      </div>

      {/* 선택된 날짜를 "0000년 00월 00일" 형식으로 출력 */}
      <h3>{formatSelectedDate(selectedDate)} 재료 보기</h3>

      {/* Firestore에서 가져온 재료 정보가 있을 경우 출력 */}
      {ingredientArray.length > 0 ? (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>품목</th>
              <th>단위</th>

              <th>기본재고</th>
              <th>현재고</th>
              <th>주문 (수량 * amount)</th>
              <th>사입</th>
            </tr>
          </thead>
          <tbody>
            {ingredientArray.map((ingredient, index) => (
              <tr key={index}>
                <td>{ingredient.name}</td>
                <td>{ingredient.unit}</td>

                <td>
                  <input
                    type="number"
                    value={ingredient.basicStock}
                    onChange={(e) =>
                      handleStockChange(
                        ingredient.name,
                        "basicStock",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={ingredient.currentStock}
                    onChange={(e) =>
                      handleStockChange(
                        ingredient.name,
                        "currentStock",
                        Number(e.target.value)
                      )
                    }
                  />
                </td>
                <td>{ingredient.amount}</td>
                <td>{ingredient.purchase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>해당 날짜에 재료 정보가 없습니다.</p>
      )}
    </div>
  );
}

export default Stock;
