import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Send,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookMarked,
} from "lucide-react";
import { api } from "../../api/api"; // Sizning axios instansingiz
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getUserFromToken from "./../../hooks/use-user";
import { get } from "lodash";

// Test vaqti (sekundlarda)
const TEST_DURATION = 15 * 60; // 15 daqiqa

const Questions = () => {
  const { categoryId: urlCategoryId } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();
  
  

  // URLda categoryId mavjud bo'lsa darhol 'test' ga o'tamiz
  const [step, setStep] = useState(
    urlCategoryId ? "loading" : "select_category"
  );
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]); // Test uchun (correct javobsiz)
  const [fullQuestions, setFullQuestions] = useState([]); // Natija uchun (correct javoblar bilan)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Javoblar massivi (DTOga mos)
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [sessionId] = useState(
    `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  );
  const [result, setResult] = useState(null); // Backenddan kelgan natija
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- 2. Savollarni yuklash (faqat id, question, options) ---
  const fetchQuestions = useCallback(
    async (catId, category) => {
      setLoading(true);
      setError("");
      setSelectedCategory(category);

      try {
        // Backend: /questions/test/:categoryId dan savollarni olamiz (to'g'ri javobsiz)
        const res = await api.get(`/questions/test/${catId}`);

        if (res.data.length === 0) {
          toast.warn("Bu kategoriyada savollar mavjud emas.");
          // Agar URL orqali kirgan bo'lsa, kategoriyalarni ko'rsatishga qaytamiz
          if (urlCategoryId) navigate("/questions", { replace: true });
          setStep("select_category");
          return;
        }

        setQuestions(res.data);
        // Javoblar massivini DTO strukturasi bilan to'ldirish
        setAnswers(
          res.data.map((q) => ({
            questionId: q.id,
            userAnswerIndex: undefined,
            userAnswerText: "",
          }))
        );
        setCurrentIndex(0);
        setTimeLeft(TEST_DURATION);
        setStep("test");
      } catch (err) {
        console.error(err.response?.data || err);
        toast.error(
          "Savollarni yuklashda xato. Iltimos, boshqa kategoriyani tanlang."
        );
        // Xato yuz bersa, kategoriyalarni ko'rsatamiz
        if (urlCategoryId) navigate("/questions", { replace: true });
        setStep("select_category");
      } finally {
        setLoading(false);
      }
    },
    [urlCategoryId, navigate]
  );

  // --- 1. Kategoriyalarni yuklash va boshlang'ich holatni tekshirish ---
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/categories");
        setCategories(res.data);

        // Agar URLda kategoriya IDsi bo'lsa, savollarni yuklaymiz
        if (urlCategoryId) {
          const cat = res.data.find((c) => c.id === +urlCategoryId);
          if (cat) {
            await fetchQuestions(cat.id, cat);
          } else {
            toast.error("Tanlangan kategoriya topilmadi.");
            navigate("/questions", { replace: true });
            setStep("select_category");
          }
        } else {
          setStep("select_category");
        }
      } catch (err) {
        toast.error("Kategoriyalarni yuklashda xato");
        setStep("select_category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [urlCategoryId, fetchQuestions, navigate]);

  // --- Kategoriya tanlanganda (page o'zgarmaydi) ---
  const handleCategorySelect = (category) => {
    // navigate('/questions/' + category.id); // <- Bu satr olib tashlandi
    fetchQuestions(category.id, category); // Savollarni yuklab, stepni 'test' ga o'tkazamiz
  };

  // --- 3. Timer ---
  useEffect(() => {
    if (step === "test" && timeLeft > 0 && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(0); // Vaqt tugasa, testni avtomatik yakunlash
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft, questions.length]);

  const handleAnswerChange = (value) => {
    const updated = [...answers];
    const q = questions[currentIndex];

    if (!q || !updated[currentIndex]) return;

    if (q.options && q.options.length > 0) {
      // Variantli savol: index ni saqlaymiz, matnni tozlaymiz
      updated[currentIndex].userAnswerIndex = value;
      updated[currentIndex].userAnswerText = undefined;
    } else {
      // Matnli savol: matnni saqlaymiz, indexni tozlaymiz
      updated[currentIndex].userAnswerText = value;
      updated[currentIndex].userAnswerIndex = undefined;
    }
    setAnswers(updated);
  };

  const handlePrev = () =>
    currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const handleNext = () =>
    currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);

  // --- 4. Testni yakunlash (Natijani backendga yuborish) ---
  const handleSubmit = async (remainingTime = timeLeft) => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Natijani saqlash uchun yuklama (payload)
      const payload = {
        studentFullName: get(user, "username"), // O'quvchi ismi
        categoryId: selectedCategory.id,
        sessionId,
        totalQuestions: questions.length,
        answers: answers.map((ans) => ({
          questionId: ans.questionId,
          // Backend DTOga moslash: agar javob berilmagan bo'lsa -1, aks holda index/text
          userAnswerIndex:
            ans.userAnswerIndex !== undefined ? ans.userAnswerIndex : -1,
          userAnswerText: ans.userAnswerText,
        })),
        timeSpent: TEST_DURATION - remainingTime, // Sarflangan vaqt
      };

      // Backend: /results endpoint'iga yuborish
      const resultRes = await api.post("/results", payload);
      setResult(resultRes.data); // Backenddan kelgan natija (score, percentage, detailedAnswers)

      // 2. Natijalar tahlili uchun savollarning to'liq ma'lumotlarini olish
      const fullRes = await api.get(`/questions/test/${selectedCategory.id}`);

      // Faqat testga tushgan savollarni tartib bilan tanlab olish
      const testQuestionIds = questions.map((q) => q.id);
      const orderedFullQuestions = testQuestionIds
        .map((id) => fullRes.data.find((q) => q.id === id))
        .filter((q) => q);

      setFullQuestions(orderedFullQuestions);
      setStep("result");
    } catch (err) {
      console.error("Xato yuz berdi:", err.response?.data || err.message);
      toast.error(
        "Natija saqlanmadi. Xato: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = ((TEST_DURATION - timeLeft) / TEST_DURATION) * 100;

  // --- 5. Yordamchi funksiyalar (Natija ekrani uchun) ---
  const getCorrectAnswerDisplay = (q) => {
    if (q.options && q.options.length > 0) {
      if (q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined) {
        const char = String.fromCharCode(65 + q.correctAnswerIndex);
        return `${char}. ${q.options[q.correctAnswerIndex]}`;
      }
      return "Noma'lum javob indeksi";
    }
    return q.correctTextAnswer || "Noma'lum matnli javob";
  };

  const getUserAnswerDisplay = (q, detailedAns) => {
    if (q.options && q.options.length > 0) {
      const index = detailedAns.userAnswerIndex;
      if (index !== undefined && index >= 0 && index < q.options.length) {
        return `${String.fromCharCode(65 + index)}. ${q.options[index]}`;
      }
      return "Javob berilmagan";
    }
    return detailedAns.userAnswerText?.trim() || "Javob berilmagan";
  };

  const getQuestionByAnswer = (detailedAns) => {
    return fullQuestions.find((q) => q.id === detailedAns.questionId);
  };

  // --- Render Mantiqi ---

  const renderContent = () => {
    if (step === "loading" && urlCategoryId) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Savollar yuklanmoqda...</p>
        </div>
      );
    }

    if (step === "select_category") {
      return (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center mb-8">
            <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-800">Test tizimi</h1>
            <p className="text-gray-600 mt-1">Kategoriyani tanlang</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Skeleton loader for categories */}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 text-center transition-all hover:shadow-lg"
                >
                  <BookMarked className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {cat.name}
                  </h3>
                </button>
              ))}
            </div>
          )}

          {categories.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-600">
              <AlertCircle className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <p>Hozircha kategoriyalar mavjud emas.</p>
            </div>
          )}
        </div>
      );
    }

    if (step === "test" || step === "result") {
      return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span className="text-lg font-semibold">
                {selectedCategory?.name || "Test"}
              </span>
            </div>
            {step === "test" && (
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {step === "test" && (
            <div className="h-1.5 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Asosiy kontent */}
          <div className="p-6">
            {/* ... Error va Loading (faqat test vaqtida) ... */}

            {/* Test jarayoni */}
            {step === "test" && questions.length > 0 && !loading && (
              <div className="space-y-7">
                <div className="text-center text-gray-600">
                  Savol{" "}
                  <span className="font-bold text-lg">{currentIndex + 1}</span>{" "}
                  / {questions.length}
                </div>

                <h3 className="text-xl font-medium text-gray-800 leading-relaxed">
                  {questions[currentIndex].question}
                </h3>

                {/* Variantli savol */}
                {questions[currentIndex].options &&
                questions[currentIndex].options.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {questions[currentIndex].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerChange(idx)}
                        className={`p-4 rounded-lg text-left transition-all border-2 ${
                          answers[currentIndex]?.userAnswerIndex === idx
                            ? "bg-blue-100 border-blue-500 shadow-md"
                            : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Matnli savol */
                  <input
                    type="text"
                    value={answers[currentIndex]?.userAnswerText || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Javobingizni bu yerga yozing..."
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                  />
                )}

                <div className="flex justify-between pt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Oldingi
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
                    >
                      Keyingi
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmit(timeLeft)}
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition disabled:opacity-70"
                    >
                      <Send className="w-5 h-5" />
                      Testni yakunlash
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Natija sahifasi */}
            {step === "result" && result && fullQuestions.length > 0 && (
              <div className="space-y-7">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                  Test yakunlandi!
                </h2>

                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <div className="text-5xl font-black text-blue-700">
                    {result.score} / {result.total}
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {result.percentage}%
                  </div>
                  <div className="text-gray-600 mt-4 flex items-center justify-center gap-2">
                    <Clock className="w-6 h-6" />
                    Sarflangan vaqt: {formatTime(result.timeSpent)}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Javoblar tahlili
                  </h3>

                  {result.detailedAnswers.map((detailedAns, idx) => {
                    const q = getQuestionByAnswer(detailedAns);
                    if (!q) return null;

                    const isCorrect = detailedAns.isCorrect;
                    const userAnswerText = getUserAnswerDisplay(q, detailedAns);
                    const correctAnswerText = getCorrectAnswerDisplay(q);

                    return (
                      <div
                        key={idx}
                        className={`p-5 rounded-xl border-l-4 flex justify-between items-start gap-4 ${
                          isCorrect
                            ? "bg-green-50 border-green-500"
                            : "bg-red-50 border-red-500"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">
                            {idx + 1}. {q.question}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Sizning javobingiz:</strong>{" "}
                            {userAnswerText}
                          </p>

                          {!isCorrect && (
                            <p className="text-sm text-green-700 mt-2">
                              <strong>To'g'ri javob:</strong>{" "}
                              {correctAnswerText}
                            </p>
                          )}
                        </div>

                        {isCorrect ? (
                          <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-7 h-7 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => navigate("/")}
                  className="w-full py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Bosh sahifaga qaytish
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />

      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto">{renderContent()}</div>
      </div>
    </>
  );
};

export default Questions;
