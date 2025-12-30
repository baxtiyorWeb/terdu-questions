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
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { api } from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import getUserFromToken from "./../../hooks/use-user";
import { get } from "lodash";

const TEST_DURATION = 15 * 60; // 15 daqiqa

const Questions = () => {
  // Endi URLdan categoryId (raqam) olinadi
  const { categoryId: urlCategoryId } = useParams(); // :categoryId sifatida route o'zgartirilgan bo'lishi kerak
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [step, setStep] = useState(
    urlCategoryId ? "loading" : "select_category"
  );
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [fullQuestions, setFullQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [sessionId] = useState(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;

  // categoryId orqali testni boshlash
  const startTestByCategoryId = useCallback(
    async (catId, categoriesList) => {
      const category = categoriesList.find((c) => c.id === parseInt(catId));

      if (!category) {
        toast.error("Kategoriya topilmadi.");
        navigate("/questions", { replace: true });
        return;
      }

      setSelectedCategory(category);
      setLoading(true);

      try {
        const res = await api.get(`/questions/test/${category.id}`);

        if (res.data.length === 0) {
          toast.warn("Bu kategoriyada savollar mavjud emas.");
          navigate("/questions", { replace: true });
          return;
        }

        setQuestions(res.data);
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
        toast.error("Savollarni yuklashda xato.");
        navigate("/questions", { replace: true });
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // Kategoriyalarni yuklash va URLdan ID bo'lsa — avto boshlash
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await api.get("/categories");
        setCategories(res.data);

        if (urlCategoryId) {
          await startTestByCategoryId(urlCategoryId, res.data);
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
  }, [urlCategoryId, startTestByCategoryId]);

  // Timer
  useEffect(() => {
    if (step === "test" && timeLeft > 0 && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft, questions.length]);

  // Kategoriya tanlanganda — ID orqali yo'naltirish
  const handleCategorySelect = (category) => {
    navigate(`/questions/${category.id}`); // Endi faqat ID ishlatiladi
  };

  const handleAnswerChange = (value) => {
    const updated = [...answers];
    const q = questions[currentIndex];

    if (!q || !updated[currentIndex]) return;

    if (q.options && q.options.length > 0) {
      updated[currentIndex].userAnswerIndex = value;
      updated[currentIndex].userAnswerText = undefined;
    } else {
      updated[currentIndex].userAnswerText = value;
      updated[currentIndex].userAnswerIndex = undefined;
    }
    setAnswers(updated);
  };

  const handlePrev = () =>
    currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const handleNext = () =>
    currentIndex < questions.length - 1 && setCurrentIndex(currentIndex + 1);

  const handleSubmit = async (remainingTime = timeLeft) => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        studentFullName: get(user, "username", "Talaba"),
        categoryId: selectedCategory.id,
        sessionId,
        totalQuestions: questions.length,
        answers: answers.map((ans) => ({
          questionId: ans.questionId,
          userAnswerIndex:
            ans.userAnswerIndex !== undefined ? ans.userAnswerIndex : -1,
          userAnswerText: ans.userAnswerText || "",
        })),
        timeSpent: TEST_DURATION - remainingTime,
      };

      const resultRes = await api.post("/results", payload);
      setResult(resultRes.data);

      try {
        const fullRes = await api.get(`/questions/test/${selectedCategory.id}`);
        const testQuestionIds = questions.map((q) => q.id);
        const orderedFullQuestions = testQuestionIds
          .map((id) => fullRes.data.find((q) => q.id === id))
          .filter(Boolean);

        setFullQuestions(orderedFullQuestions);
      } catch (err) {
        setFullQuestions([]);
      }

      setStep("result");
    } catch (err) {
      toast.error(
        "Natija saqlanmadi: " + (err.response?.data?.message || err.message)
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    toast.success("Havola nusxalandi!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getCorrectAnswerDisplay = (q) => {
    if (q.options && q.options.length > 0) {
      if (q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined) {
        const char = String.fromCharCode(65 + q.correctAnswerIndex);
        return `${char}. ${q.options[q.correctAnswerIndex]}`;
      }
      return "Noma'lum";
    }
    return q.correctTextAnswer || "Noma'lum";
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

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Ulashish tugmasi — faqat test yoki natija sahifasida */}
          {(step === "test" || step === "result") && selectedCategory && (
            <div className="flex justify-end mb-4">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow transition text-sm font-medium text-gray-700"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                Ulashish
                {copied ? (
                  <Check className="w-4 h-4 text-green-600 ml-1" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500 ml-1" />
                )}
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Kategoriya tanlash sahifasi */}
            {step === "select_category" && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h1 className="text-2xl font-bold text-gray-800">
                    Test tizimiga xush kelibsiz
                  </h1>
                  <p className="text-gray-600 mt-2">Kategoriyani tanlang</p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-200 animate-pulse rounded-lg h-32"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className="p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-all hover:border-blue-400 hover:shadow-md"
                      >
                        <BookMarked className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-800">
                          {cat.name}
                        </h3>
                      </button>
                    ))}
                  </div>
                )}

                {categories.length === 0 && !loading && (
                  <div className="text-center py-10">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                    <p className="text-gray-600">Kategoriyalar mavjud emas</p>
                  </div>
                )}
              </div>
            )}

            {/* Test va Natija sahifalari */}
            {(step === "test" || step === "result") && selectedCategory && (
              <>
                <div className="bg-blue-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">
                        {selectedCategory.name}
                      </h2>
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
                </div>

                {step === "test" && (
                  <div className="h-2 bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Test jarayoni */}
                  {step === "test" && questions.length > 0 && (
                    <>
                      <div className="text-center mb-6">
                        <span className="text-lg font-semibold text-gray-700">
                          Savol {currentIndex + 1} / {questions.length}
                        </span>
                      </div>

                      <h3 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
                        {questions[currentIndex].question}
                      </h3>

                      {questions[currentIndex].options &&
                      questions[currentIndex].options.length > 0 ? (
                        <div className="space-y-3">
                          {questions[currentIndex].options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswerChange(idx)}
                              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                answers[currentIndex]?.userAnswerIndex === idx
                                  ? "bg-blue-100 border-blue-500 shadow-sm"
                                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-medium text-blue-700 mr-3">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={answers[currentIndex]?.userAnswerText || ""}
                          onChange={(e) => handleAnswerChange(e.target.value)}
                          placeholder="Javobingizni yozing..."
                          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
                        />
                      )}

                      <div className="flex justify-between mt-8">
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
                            Yakunlash
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Natija sahifasi */}
                  {step === "result" && result && (
                    <div className="space-y-8">
                      <h2 className="text-2xl font-bold text-center text-gray-800">
                        Test yakunlandi!
                      </h2>

                      <div className="bg-blue-50 p-6 rounded-xl text-center">
                        <div className="text-5xl font-bold text-blue-700">
                          {result.score} / {result.total}
                        </div>
                        <div className="text-3xl font-semibold text-blue-600 mt-2">
                          {result.percentage}%
                        </div>
                        <div className="text-gray-600 mt-4 flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5" />
                          Vaqt: {formatTime(result.timeSpent)}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Javoblar tahlili
                        </h3>

                        {result.detailedAnswers.map((detailedAns, idx) => {
                          const q =
                            getQuestionByAnswer(detailedAns) || questions[idx];
                          if (!q) return null;

                          let isCorrect = detailedAns.isCorrect;
                          if (isCorrect === undefined) {
                            if (q.options && q.options.length > 0) {
                              isCorrect =
                                detailedAns.userAnswerIndex ===
                                q.correctAnswerIndex;
                            } else {
                              isCorrect =
                                detailedAns.userAnswerText
                                  ?.trim()
                                  .toLowerCase() ===
                                q.correctTextAnswer?.trim().toLowerCase();
                            }
                          }

                          const userAnswerText = getUserAnswerDisplay(
                            q,
                            detailedAns
                          );
                          const correctAnswerText = getCorrectAnswerDisplay(q);

                          return (
                            <div
                              key={idx}
                              className={`p-5 rounded-lg border-l-4 ${
                                isCorrect
                                  ? "bg-green-50 border-green-500"
                                  : "bg-red-50 border-red-500"
                              }`}
                            >
                              <p className="font-medium text-gray-800 mb-2">
                                {idx + 1}. {q.question}
                              </p>
                              <p className="text-sm">
                                <strong>Siz:</strong> {userAnswerText}
                              </p>
                              {!isCorrect && (
                                <p className="text-sm text-green-700 mt-1">
                                  <strong>To'g'ri:</strong> {correctAnswerText}
                                </p>
                              )}
                              <div className="mt-3">
                                {isCorrect ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => navigate("/questions")}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Boshqa testga o'tish
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Questions;
