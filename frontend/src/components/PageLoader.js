import React from "react";

function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-[280px]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export default PageLoader;