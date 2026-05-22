import React from "react";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

function TopNavbar({ title, subtitle, user, onMenuClick, rightContent }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-gray-100/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
      <div className="px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden h-11 w-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-gray-700 dark:text-slate-200"
          >
            <FaBars />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rightContent}
          <button
            onClick={toggleTheme}
            className="h-11 w-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-gray-700 dark:text-slate-200"
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>

          {user && (
            <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;