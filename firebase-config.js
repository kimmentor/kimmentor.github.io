/* =========================================================
   멘토 김부장 블로그 — Firebase 설정 (댓글 기능)
   웹앱 공개용 설정값이라 노출되어도 안전합니다.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBK81T_QhzFiC1jVC3rjCxB9nIC-6hhHj8",
  authDomain: "kimmentor-6d212.firebaseapp.com",
  projectId: "kimmentor-6d212",
  storageBucket: "kimmentor-6d212.firebasestorage.app",
  messagingSenderId: "166155822886",
  appId: "1:166155822886:web:e205bcc1c6f8d5499ec3e7"
};

// 운영진(관리자) 구글 이메일 — 이 계정으로 로그인해야 운영진 권한이 부여됩니다.
// 다른 구글 계정으로 운영하려면 이 값을 바꾸고, firestore.rules의 이메일도 같이 바꾸세요.
window.ADMIN_EMAIL = "dongsik2026@gmail.com";
