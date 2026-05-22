import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaProjectDiagram,
  FaSignOutAlt,
  FaTasks,
  FaUsers,
  FaKey,
  FaChartPie,
  FaComments,
} from "react-icons/fa";

function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <FaChartPie /> },
    { to: "/profile", label: "Profile", icon: <FaUser /> },
    { to: "/projects", label: "Projects", icon: <FaProjectDiagram /> },
    { to: "/tasks", label: "Tasks", icon: <FaTasks /> },
    { to: "/teams", label: "Teams", icon: <FaUsers /> },
     { to: "/chats", label: "Chats", icon: <FaComments /> },
    { to: "/change-password", label: "Change Password", icon: <FaKey /> },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
    }`;

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 p-6 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DevCollab</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Workspace OS</p>
          </div>
          <button
            className="lg:hidden text-gray-500 dark:text-slate-300"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;