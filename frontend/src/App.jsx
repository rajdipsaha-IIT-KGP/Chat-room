import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const [roomID, setRoomID] = useState("");
  const [joined, setJoined] = useState(false);

  const wsRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data]);
      }
    };

    return () => wsRef.current.close();
  }, []);

  const joinRoom = () => {
    if (!username.trim() || !roomID.trim()) return;

    wsRef.current.send(
      JSON.stringify({
        type: "join",
        username,
        payload: { roomID },
      })
    );

    setJoined(true);
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: username, message: messageInput, self: true }
    ]);

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        payload: { message: messageInput },
      })
    );

    setMessageInput("");
  };

  if (!joined) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl w-[380px] space-y-6">
          <h1 className="text-2xl font-bold text-center text-white tracking-wider">Join Chat Room</h1>

          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Room ID"
            className="w-full px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roomID}
            onChange={(e) => setRoomID(e.target.value)}
          />

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-3 rounded-2xl text-white font-semibold tracking-wide hover:opacity-90 transition-all"
            onClick={joinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <h2 className="text-white text-lg font-semibold tracking-wide">Room: {roomID}</h2>
        <p className="text-blue-400 text-sm font-medium">@{username}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4"
      >
        {messages.map((msg, index) => {
          const isMine = msg.from === username || msg.self;
          return (
            <div
              key={index}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-3xl max-w-[70%] shadow-lg ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white/10 text-white border border-white/10 backdrop-blur-lg rounded-bl-none"
                }`}
              >
                {!isMine && (
                  <p className="text-xs text-blue-300 mb-1">{msg.from}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-2xl placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
