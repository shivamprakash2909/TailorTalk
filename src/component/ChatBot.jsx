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
      // 1. General Gemini chat response
      const geminiRes = await axios.post(`${server}/api/gemini/chat`, {
        message: userMessage,
      });
      const reply = geminiRes.data?.reply || "🤖 (no reply)";
      setChat((prev) => [...prev, { user: false, text: reply }]);

      // 2. Extract booking or date intent
      const extractRes = await axios.post(`${server}/api/gemini/extract`, {
        message: userMessage,
      });

      const { type } = extractRes.data;

      // 2A. If it's a dateQuery → fetch and show events
      if (type === "dateQuery" && extractRes.data.date) {
        const date = extractRes.data.date;
        const listRes = await axios.post(`${server}/api/calendar/list`, { date });
        const events = listRes.data.events;

        if (!events || events.length === 0) {
          setChat((prev) => [...prev, { user: false, text: `📭 No events found on ${date}.` }]);
        } else {
          setChat((prev) => [
            ...prev,
            {
              user: false,
              element: (
                <span>
                  🗓️ <strong>Your Events on {date}:</strong>
                  <br />
                  {events.map((e, i) => {
                    const startTime = e.start?.slice(11, 16) || "??:??";
                    const endTime = e.end?.slice(11, 16) || "??:??";
                    return (
                      <div key={i} style={{ marginBottom: "8px" }}>
                        🔸 <strong>{e.summary || "No Title"}</strong> ({startTime} - {endTime}){" "}
                        {e.link && (
                          <a href={e.link} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        )}
                      </div>
                    );
                  })}
                </span>
              ),
            },
          ]);
        }
        return;
      }

      // 2B. If it's a booking → book event
      if (type === "booking" && extractRes.data.summary && extractRes.data.start && extractRes.data.end) {
        const { summary, start, end } = extractRes.data;

        const calendarRes = await axios.post(`${server}/api/calendar/book`, {
          summary,
          start,
          end,
        });

        const link = calendarRes.data.link;

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
