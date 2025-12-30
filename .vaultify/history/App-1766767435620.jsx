import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./modules/home/home";
import TeacherHome from "./modules/teacher/teacher-page";
import TeacherLayout from "./layout/teacher-layout";
import CategoryPage from "./modules/teacher/category-page";
import QuestionPage from "./modules/question";
import getUserFromToken from "./../hooks/use-user";
import { get } from "lodash";
import TeacherQuestions from "./modules/teacher/teacher-questions";
import TeacherStudentsResults from "./modules/teacher/teacher-students-results";

const ProtectedTeacherRoute = ({ children }) => {
  const user = getUserFromToken(); // Hook ichida har safar tekshiriladi

  if (!user || get(user, "role") !== "teacher") {
    return <Navigate to="/teacher" replace />;
  } else if (user && get(user, "role") === "student") {
    return <Navigate to="/questions" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Talaba va umumiy sahifalar */}
      <Route path="/" element={<Home />} />
      <Route path="/questions" element={<QuestionPage />} />
      <Route path="/questions/:categoryId" element={<QuestionPage />} />

      {/* O'qituvchi paneli */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedTeacherRoute>
            <TeacherLayout />
          </ProtectedTeacherRoute>
        }
      >
        <Route index element={<TeacherHome />} />
        <Route path="categories" element={<CategoryPage />} />
        <Route path="questions" element={<TeacherQuestions />} />
        <Route path="results" element={<TeacherStudentsResults />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
