// src/components/LoginModal.jsx (Zamonaviy va qulay dizayn)
import React, { useState } from "react";
import {
  LogIn,
  User,
  GraduationCap,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/api";

const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("select_role"); // "select_role" | "login_form"
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    // Modal yopilganda qayta tiklashni biroz keyinroq amalga oshiramiz (animatsiya tugashini kutish)
    setTimeout(() => {
      setStep("select_role");
      setRole(null);
      setUsername("");
      setPassword("");
      setError("");
    }, 300); // 300ms animatsiya vaqtiga mos
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("login_form");
    setError(""); // Xatolikni tozalash
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = role === "student" ? "/auth/student" : "/auth/login";
      const response = await api.post(endpoint, {
        username,
        password,
      });

      if (response.data?.student_access_token) {
        localStorage.setItem(
          "student_access_token",
          response.data.student_access_token
        );
      } else {
        if (!response.data?.access_token) {
          throw new Error("Token olinmadi");
        } else {
          localStorage.setItem(
            "teacher_access_token",
            response.data.access_token
          );
        }
      }
      const decodedRole = role === "student" ? "STUDENT" : "TEACHER";

      localStorage.setItem("user_role", decodedRole);

      closeModal();
      navigate(decodedRole === "STUDENT" ? "/questions" : "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login yoki parol noto'g'ri. Iltimos, tekshirib ko'ring."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={openModal}
        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <LogIn className="w-5 h-5" />
        Tizimga Kirish
      </button>
    );
  }

  // Modal komponentining asosiy qismi (ochiq holatda)
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={closeModal} // Overlay ustiga bosilganda yopish
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()} // Modal ichini bosganda yopilishini oldini olish
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition duration-200 z-10 p-1 rounded-full hover:bg-gray-100"
          aria-label="Yopish"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header - Qorong'i sarlavha qismi */}
        <div className="bg-blue-700 pt-10 pb-6 px-8 text-center border-b-4 border-blue-400">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Tizimga Kirish</h2>
          <p className="mt-1 text-blue-200 text-sm">
            O'quv platformasiga xush kelibsiz
          </p>
        </div>

        {/* Body - Kontent */}
        <div className="p-8">
          {/* 1-Qadam: Rolni Tanlash */}
          {step === "select_role" && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">
                Kim bo'lib kirmoqchisiz?
              </h3>

              {/* Talaba Karta */}
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-full flex items-center gap-6 p-6 bg-blue-50 border-2 border-blue-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:bg-blue-100 hover:border-blue-400"
              >
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-blue-800 block text-left">
                    Talaba
                  </span>
                  <p className="text-blue-600 text-sm text-left">
                    Testlar va natijalarni ko'rish uchun
                  </p>
                </div>
              </button>

              {/* O'qituvchi Karta */}
              <button
                onClick={() => handleRoleSelect("teacher")}
                className="w-full flex items-center gap-6 p-6 bg-green-50 border-2 border-green-100 rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg hover:bg-green-100 hover:border-green-400"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-green-800 block text-left">
                    O'qituvchi
                  </span>
                  <p className="text-green-600 text-sm text-left">
                    Savollar va statistikani boshqarish uchun
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* 2-Qadam: Login Formasi */}
          {step === "login_form" && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <button
                  type="button"
                  onClick={() => setStep("select_role")}
                  className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition"
                  aria-label="Orqaga"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Orqaga
                </button>
                <span
                  className={`text-lg font-semibold ${
                    role === "student" ? "text-blue-700" : "text-green-700"
                  }`}
                >
                  {role === "student" ? "Talaba" : "O'qituvchi"} Kabineti
                </span>
              </div>

              {/* Xatolik xabari */}
              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-300 text-center font-medium animate-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Foydalanuvchi nomi / ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-sm"
                  placeholder="ID yoki username kiriting"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Parol
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition shadow-sm"
                  placeholder="Parolni kiriting"
                  required
                />
              </div>

              {/* Kirish Tugmasi */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed
                  ${
                    role === "student"
                      ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                      : "bg-green-600 hover:bg-green-700 focus:ring-green-300"
                  } focus:outline-none focus:ring-4`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Yuklanmoqda...
                  </span>
                ) : (
                  "Kirish"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
