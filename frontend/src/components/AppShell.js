import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function AppShell({ title, subtitle, user, rightContent, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 min-w-0">
          <TopNavbar
            title={title}
            subtitle={subtitle}
            user={user}
            rightContent={rightContent}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;