import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

const ChatBox = ({ currentUserId, targetUserId, targetName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!targetUserId) return;

    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/chat/conversation/${targetUserId}`, {
        headers: { Authorization: token },
      })
      .then((res) => setMessages(res.data || []))
      .catch((err) => console.error("Failed to load chat history", err));
  }, [targetUserId]);

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

          const relevant =
            (String(body.senderId) === String(currentUserId) &&
              String(body.receiverId) === String(targetUserId)) ||
            (String(body.senderId) === String(targetUserId) &&
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
  }, [currentUserId, targetUserId]);

  const sendMessage = () => {
    if (!connected || !clientRef.current || !input.trim() || !targetUserId) return;

    clientRef.current.publish({
      destination: `/app/chat.private`,
      body: JSON.stringify({
        receiverId: Number(targetUserId),
        content: input.trim(),
      }),
    });

    setInput("");
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Chat with {targetName || "User"}
        </h2>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {connected ? "Connected" : "Connecting..."}
        </span>
      </div>

      <div className="border rounded-xl bg-gray-50 h-80 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const mine = String(msg.senderId) === String(currentUserId);

            return (
              <div
                key={msg.id ?? `${msg.senderId}-${msg.sentAt}-${msg.content}`}
                className={`p-3 rounded-lg shadow-sm ${
                  mine ? "bg-blue-50 border border-blue-100" : "bg-white"
                }`}
              >
                <p className="font-semibold text-blue-700">
                  {mine ? "You" : targetName}
                </p>
                <p className="text-gray-700">{msg.content}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={connected ? "Type message..." : "Waiting for connection..."}
          disabled={!connected || !targetUserId}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          onClick={sendMessage}
          disabled={!connected || !input.trim() || !targetUserId}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;