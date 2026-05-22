import React from "react";
import { useToast } from "../context/ToastContext";

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getTypeClasses = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-500 text-white";
      case "error":
        return "bg-rose-500 text-white";
      case "warning":
        return "bg-amber-500 text-white";
      default:
        return "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 w-[calc(100%-2rem)] max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl shadow-xl px-4 py-3 flex items-start justify-between gap-3 animate-slide-in ${getTypeClasses(toast.type)}`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-sm opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;