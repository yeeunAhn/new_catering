import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore"; // Firestore 관련 함수 불러오기
import { dbFirestore } from "./firebaseConfig"; // Firestore 설정 불러오기

function Settings() {
  const [loading, setLoading] = useState(false);

  // "닭다리덮밥" 레시피 저장하는 함수
  const handleSaveRecipe = async () => {
    setLoading(true);

    const recipe = {
      menuName: "닭다리덮밥",
      ingredients: {
        chickenLeg: { amount: 1, unit: "개" }, // 닭다리 1개
        onion: { amount: 45, unit: "g" }, // 양파 45g
        sauce: { amount: 10, unit: "g" }, // 소스 10g
      },
    };

    try {
      // Firestore의 "menus" 컬렉션에 "닭다리덮밥" 문서 생성
      const recipeRef = doc(dbFirestore, "menus", "닭다리덮밥"); // Firestore 경로 설정
      await setDoc(recipeRef, recipe); // Firestore에 데이터 저장
      console.log("Recipe saved successfully.");
    } catch (e) {
      console.error("Error saving recipe: ", e);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>설정 페이지</h2>
      <button onClick={handleSaveRecipe} disabled={loading}>
        {loading ? "저장 중..." : "레시피 저장하기"}
      </button>
    </div>
  );
}

export default Settings;
