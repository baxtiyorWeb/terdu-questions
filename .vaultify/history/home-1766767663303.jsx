import React from "react";
import { Header } from "../../components/header";
import logo_img from "./../../../public/img/logo_tersu.png";
import { Zap, Timer, CheckCircle, BookOpen, GraduationCap } from "lucide-react";

const Home = () => {
  const features = [
    {
      id: 1,
      title: "Tezkor va qulay",
      description: "Savollarga tez va oson javob bering",
      icon: <Zap className="w-12 h-12 text-blue-600" />,
    },
    {
      id: 2,
      title: "Yetarli vaqt",
      description: "Har bir test uchun optimal vaqt ajratilgan",
      icon: <Timer className="w-12 h-12 text-green-600" />,
    },
    {
      id: 3,
      title: "Aniq baholash",
      description: "Avtomatik tekshiruv va adolatli natijalar",
      icon: <CheckCircle className="w-12 h-12 text-purple-600" />,
    },
    {
      id: 4,
      title: "Ilmiy asosda",
      description: "Fan dasturiga mos savollar va materiallar",
      icon: <BookOpen className="w-12 h-12 text-indigo-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <Header />

      <div className=" mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img
            className="mx-auto w-48 h-48 mb-8 drop-shadow-lg"
            src={logo_img}
            alt="Termiz Davlat Universiteti logotipi"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Termiz Davlat Universiteti talabalari uchun <br />
            <span className="text-blue-600">O'zbek tilining sohada qo'llanilishi</span> fanidan
            <br />
            <span className="inline-flex items-center gap-3 mt-2">
              <GraduationCap className="w-12 h-12 text-blue-600" />
              onlayn savollar tizimi
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Zamonaviy va qulay platformada bilimlaringizni sinab ko'ring!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-center mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg transition transform hover:scale-105">
            Testni boshlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;