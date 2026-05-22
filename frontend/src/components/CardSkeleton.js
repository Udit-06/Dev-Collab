import React from "react";

function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 animate-pulse"
        >
          <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded mb-4" />
          <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded mb-3" />
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-800 rounded mb-3" />
          <div className="h-10 w-28 bg-gray-200 dark:bg-slate-800 rounded mt-6" />
        </div>
      ))}
    </>
  );
}

export default CardSkeleton;