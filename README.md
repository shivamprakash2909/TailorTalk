# 🤖 TailorTalk - React Frontend

TailorTalk is a conversational AI assistant that helps users schedule meetings via natural language. This is the **React frontend** that communicates with a backend powered by LLMs like **Gemini** and integrates with **Google Calendar** to book events.

---

## 🚀 Features

- ✨ Chat interface powered by AI (Gemini)
- 📅 Automatically books Google Calendar events
- 🧠 Maintains chat history in UI
- 🔗 Clickable calendar links
- 🧑‍💻 Modern, clean UI built in React
- 💬 Handles conversational follow-ups

---

## 🖼️ Preview

![Live link](https://tailor-talk-mu.vercel.app/)

---

## 🧩 Backend Integration

Make sure the **TailorTalk backend** is running.

### 🔗 GitHub (Backend):

👉 [TailorTalk Server Repository](https://github.com/shivamprakash2909/TailorTalk-Server)

---

### 🌐 Backend API Endpoints

| Endpoint                   | Purpose                         |
| -------------------------- | ------------------------------- |
| `POST /api/gemini/chat`    | Chat with Gemini / Gemma LLM    |
| `POST /api/gemini/extract` | Extract event details           |
| `POST /api/calendar/book`  | Book event into Google Calendar |

---

## 🔧 Setup Instructions

1. **Clone the frontend repository**

```bash
git clone https://github.com/shivamprakash2909/TailorTalk.git
cd tailortalk-frontend
```
