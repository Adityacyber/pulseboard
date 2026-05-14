import { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const location = useLocation();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const navLinks = [
    {
      name: "Dashboard",
      path: "/",
    },
    {
      name: "Create Poll",
      path: "/create",
    },
  ];

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        backdrop-blur-xl
        bg-[#0F0F1A]/80
        border-b
        border-white/10
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-4
          flex
          items-center
          justify-between
        "
      >
        {/* Logo */}
        <Link
          to="/"
          className="
            text-3xl
            font-black
            bg-gradient-to-r
            from-violet-400
            to-purple-600
            bg-clip-text
            text-transparent
            tracking-tight
          "
        >
          PulseBoard
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`
                      px-5
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      transition-all
                      duration-300
                      border

                      ${
                        isActive
                          ? `
                            bg-gradient-to-r
                            from-violet-600
                            to-purple-600
                            text-white
                            border-transparent
                            shadow-lg
                            shadow-violet-500/20
                          `
                          : `
                            text-gray-300
                            border-white/10
                            hover:bg-white/5
                            hover:text-white
                          `
                      }
                    `}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </>
          )}

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="
                ml-2
                px-5
                py-2.5
                rounded-xl
                text-sm
                font-semibold
                text-white
                bg-white/5
                border
                border-white/10
                hover:bg-red-500/20
                hover:border-red-500/30
                transition-all
                duration-300
              "
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  text-sm
                  font-medium
                  text-gray-300
                  border
                  border-white/10
                  hover:bg-white/5
                  hover:text-white
                  transition-all
                  duration-300
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  text-sm
                  font-semibold
                  text-white
                  bg-gradient-to-r
                  from-violet-600
                  to-purple-600
                  hover:scale-105
                  transition-all
                  duration-300
                  shadow-lg
                  shadow-violet-500/20
                "
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
