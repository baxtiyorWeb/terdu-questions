import axios from "axios";

function getTeacherAccessToken() {
  return localStorage.getItem("teacher_access_token");
}

function getStudentAccessToken() {
  return localStorage.getItem("student_access_token");
}

function getAuthToken() {
  const role = localStorage.getItem("user_role");

  if (role === "TEACHER") {
    return getTeacherAccessToken();
  }

  if (role === "STUDENT") {
    return getStudentAccessToken();
  }

  return null;
}

export const api = axios.create({
  baseURL: "https://terdu-qustions.vercel.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
