import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConversation } from "../api/chatApi";

const PrivateChatBox = ({ currentUserId, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?.id) {
      setMessages([]);
      return;
    }

    loadConversation(selectedUser.id);
  }, [selectedUser?.id]);

  const loadConversation = async (otherUserId) => {
    try {
      const res = await getConversation(otherUserId);
      setMessages(res.data || []);
    } catch (error) {
      console.error("Failed to load conversation", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cleanToken = token?.startsWith("Bearer ") ? token.substring(7) : token;

    if (!cleanToken) {
      setConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${cleanToken}`,
      },
      onConnect: () => {
        setConnected(true);

        client.subscribe(`/user/queue/messages`, (message) => {
          const body = JSON.parse(message.body);

          if (!selectedUser?.id) return;

          const relevant =
            (String(body.senderId) === String(currentUserId) &&
              String(body.receiverId) === String(selectedUser.id)) ||
            (String(body.senderId) === String(selectedUser.id) &&
              String(body.receiverId) === String(currentUserId));

          if (relevant) {
            setMessages((prev) => [...prev, body]);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error("Broker error:", frame.headers["message"]);
        console.error("Details:", frame.body);
        setConnected(false);
      },
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [currentUserId, selectedUser?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!connected || !clientRef.current || !input.trim() || !selectedUser?.id) {
      return;
    }

    clientRef.current.publish({
      destination: `/app/chat.private`,
      body: JSON.stringify({
        receiverId: Number(selectedUser.id),
        content: input.trim(),
      }),
    });

    setInput("");
  };

  if (!selectedUser) {
    return (
      <div className="h-[600px] rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-gray-500 dark:text-slate-400">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-sm">
      <div className="border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            connected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50 dark:bg-slate-950">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const mine = String(msg.senderId) === String(currentUserId);

            return (
              <div
                key={msg.id ?? `${msg.senderId}-${msg.sentAt}-${msg.content}`}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    mine
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-800"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[11px] mt-2 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-slate-800 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={connected ? "Type message..." : "Waiting for connection..."}
          disabled={!connected}
          className="flex-1 rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !input.trim()}
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 text-sm font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PrivateChatBox;