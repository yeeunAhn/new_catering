import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Orders from "./Orders";
import Stock from "./Stock";
import Settings from "./Settings";
import Main from "./Main"; // 메인 페이지 컴포넌트 추가

function App() {
  const [orderList, setOrderList] = useState([]);

  // 주문 데이터를 처리하는 함수
  const handleOrderSubmit = (menuName, quantity) => {
    setOrderList([...orderList, { menuName, quantity }]);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} /> {/* 메인 페이지 경로 */}
          <Route
            path="/orders"
            element={
              <Orders onOrderSubmit={handleOrderSubmit} orderList={orderList} />
            }
          />
          <Route path="/stock" element={<Stock />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>

        <nav className="bottom-tabs">
          <Link to="/orders" className="tab-link">
            주문 확인
          </Link>
          <Link to="/stock" className="tab-link">
            재료 확인
          </Link>
          <Link to="/settings" className="tab-link">
            설정
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
