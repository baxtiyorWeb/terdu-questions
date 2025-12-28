import { jwtDecode } from "jwt-decode";

const getUserFromToken = () => {
  const role = localStorage.getItem("user_role");

  let token;
  if (role === "STUDENT") {
    token = localStorage.getItem("student_access_token");
  } else if (role === "TEACHER") {
    token = localStorage.getItem("teacher_access_token");
  } else {
    return null;
  }

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Tokenni decode qilishda xatolik:", error);
    return null;
  }
};

export default getUserFromToken;
