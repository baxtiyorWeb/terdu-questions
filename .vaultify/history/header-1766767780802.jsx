import Container from "./../shared/container";
import { Link, useLocation } from "react-router-dom";
import { Home, Info, Mail, GraduationCap, Menu, X, CircleQuestionMarkIcon } from "lucide-react";
import logo_img from "./../../public/img/logo_tersu.png";
import React, { useState } from "react";
import LoginModal from "./login-modal";
import getUserFromToken from "../../hooks/use-user";
import { get } from "lodash";
export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getUserFromToken();

  const navigationLinks = [
    { name: "Bosh sahifa", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Savollar", path: "/", icon: <CircleQuestionMarkIcon className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-linear-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50">
      <Container>
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo_img}
              alt="Termiz Davlat Universiteti"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full ring-4 ring-white/20 group-hover:ring-white/40 transition-all"
            />
            <div className="text-white">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 md:w-7 md:h-7" />
                <span className="text-lg md:text-xl font-bold">TerDU Test</span>
              </div>
              <p className="hidden sm:block text-xs text-blue-200 opacity-90">
                O'zbek tilining sohada qo'llanilishi
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-2">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300
                  ${
                    isActive(link.path)
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-white hover:bg-white/20"
                  }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {get(user, "role") === "student" ||
            get(user, "role") === "teacher" ? (
              <Link
                to={get(user, "role") === "student" ? "/questions/" : "/teacher/"}
                className="px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-white/80 transition"
              >
                {get(user, "role") === "student"
                  ? "Talaba paneli"
                  : "O'qituvchi paneli"}
              </Link>
            ) : (
              <LoginModal />
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/20 transition"
          >
            {mobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all
                    ${
                      isActive(link.path)
                        ? "bg-white text-blue-700"
                        : "text-white hover:bg-white/20"
                    }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="px-6 pt-4">
                {get(user, "role") === "student" ||
                get(user, "role") === "teacher" ? (
                  <Link
                    to={get(user, "role") === "student" ? "/questions/" : "/teacher/"}
                    className="block w-full text-center px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-white/80 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {get(user, "role") === "student"
                      ? "Talaba paneli"
                      : "O'qituvchi paneli"}
                  </Link>
                ) : (
                  <LoginModal />
                )}
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};
