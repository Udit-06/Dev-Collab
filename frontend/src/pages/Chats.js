import React, { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import PrivateChatBox from "../components/PrivateChatBox";
import { getChatUsers } from "../api/chatApi";
import { getProfile } from "../api/auth";
import { useToast } from "../context/ToastContext";

function Chats() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, usersRes] = await Promise.all([
        getProfile(),
        getChatUsers(),
      ]);

      setCurrentUser(profileRes.data);
      setChatUsers(usersRes.data || []);

      if ((usersRes.data || []).length > 0) {
        setSelectedUser(usersRes.data[0]);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load chats", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Chats"
      subtitle="One-to-one messaging with your workspace members"
      user={currentUser}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm h-[600px] overflow-y-auto">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Conversations</h2>

          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading chats...</p>
          ) : chatUsers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No users available.</p>
          ) : (
            <div className="space-y-2">
              {chatUsers.map((user) => {
                const active = String(selectedUser?.id) === String(user.id);

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition ${
                      active
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900"
                        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    {user.lastMessage && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 truncate">
                        {user.lastMessage}
                      </p>
                    )}
                    {user.lastMessageTime && (
                      <p className="text-[11px] text-slate-400 mt-1">{user.lastMessageTime}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <PrivateChatBox
          currentUserId={currentUser?.id}
          selectedUser={selectedUser}
        />
      </div>
    </AppShell>
  );
}

export default Chats;