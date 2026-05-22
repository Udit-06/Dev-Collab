import React, { useEffect, useMemo, useState } from "react";
import {
  getDashboardStats,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  getCalendarEvents,
} from "../api/analyticsApi";
import { getProfile } from "../api/auth";
import AppShell from "../components/AppShell";
import PageLoader from "../components/PageLoader";
import { useToast } from "../context/ToastContext";

import {
  FaBell,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#2563EB", "#F59E0B", "#10B981"];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, notifRes, unreadRes, eventsRes] = await Promise.all([
        getProfile(),
        getDashboardStats(),
        getNotifications(),
        getUnreadNotificationCount(),
        getCalendarEvents(),
      ]);

      setUser(profileRes.data);
      setStats(statsRes.data);
      setNotifications(notifRes.data || []);
      setUnreadCount(unreadRes.data || 0);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const taskStatusData = useMemo(() => {
    if (!stats?.taskStatusData) return [];
    return Object.entries(stats.taskStatusData).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const productivityData = useMemo(() => {
    if (!stats?.productivityByMember) return [];
    return Object.entries(stats.productivityByMember).map(([name, completed]) => ({
      name,
      completed,
    }));
  }, [stats]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      await loadAll();
      showToast("Notification marked as read", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update notification", "error");
    }
  };

  const rightContent = (
    <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 px-4 py-2">
      <FaBell className="text-amber-500" />
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{unreadCount}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">Unread</span>
    </div>
  );

  if (loading) {
    return (
      <AppShell title="Dashboard" subtitle="Live overview of your workspace" user={user} rightContent={rightContent}>
        <PageLoader label="Loading dashboard..." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Live overview of your workspace"
      user={user}
      rightContent={rightContent}
    >
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Total Projects</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalProjects}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalTasks}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Completed Tasks</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.completedTasks}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Active Teams</p>
            <p className="text-3xl font-bold text-violet-600">{stats.activeTeams}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Task Status</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaBell className="text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.read
                      ? "border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-950"
                      : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.type}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{item.message}</p>
                  {!item.read && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Team Productivity</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h2>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">No deadlines found.</p>
            ) : (
              events.map((event) => (
                <div
                  key={`${event.type}-${event.id}`}
                  className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 p-4"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{event.type}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">{event.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Project Progress</h2>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.projectProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projectName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completedTasks" fill="#2563EB" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalTasks" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      
    </AppShell>
  );
}

export default Dashboard;