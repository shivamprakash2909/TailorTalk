import { useState } from "react";
import axios from "axios";
import "./ChatBot.css";

const ChatBot = () => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const server =
    import.meta.env.MODE === "development" ? import.meta.env.VITE_ORIGIN : import.meta.env.VITE_ORIGIN_PROD;
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setChat((prev) => [...prev, { user: true, text: userMessage }]);
    setMessage("");

    try {
      // 1. Send user message to Gemini chat
      const geminiRes = await axios.post(`${server}/api/gemini/chat`, {
        message: userMessage,
      });

      const reply = geminiRes.data?.reply || "🤖 (no reply)";
      setChat((prev) => [...prev, { user: false, text: reply }]);

      // 2. If intent to book detected, extract & book
      if (/book|schedule|meeting|call/i.test(userMessage)) {
        const extractRes = await axios.post(`${server}/api/gemini/extract`, {
          message: userMessage,
        });

        const { summary, start, end } = extractRes.data;

        const calendarRes = await axios.post(`${server}/api/calendar/book`, {
          summary,
          start,
          end,
        });

        const link = calendarRes.data.link;

        // 3. Push a clickable booking confirmation
        setChat((prev) => [
          ...prev,
          {
            user: false,
            element: (
              <span>
                ✅ Event booked: <strong>{summary}</strong>
                <br />
                🕒 {start} - {end}
                <br />
                🔗{" "}
                <a href={link} target="_blank" rel="noopener noreferrer">
                  See in Calendar
                </a>
              </span>
            ),
          },
        ]);
      }
    } catch (err) {
      const error = err.response?.data?.error || err.message;
      setChat((prev) => [...prev, { user: false, text: `❌ Error: ${error}` }]);
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">🤖 TailorTalk</h2>

      <div className="chat-box">
        {chat.map((msg, idx) => (
          <div key={idx} className={`message ${msg.user ? "user" : "bot"}`}>
            <strong>{msg.user ? "🧑 You" : "🤖 Bot"}:</strong> {msg.element ? msg.element : msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          placeholder="Type your message..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
export default ChatBot;
