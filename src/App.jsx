import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/agent-ask";

const SUGGESTIONS = [
  "How do I fix the refresh token issue?",
  "What does the Booking API expect?",
  "Walk me through the quote API workflow",
];

const SYNCED_DOCS = [
  "Booking API Documentation",
  "Refresh Token Issue",
];

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.4" fill="currentColor" />
      <circle cx="9" cy="14" r="1.4" fill="currentColor" />
      <circle cx="15" cy="14" r="1.4" fill="currentColor" />
      <path d="M9 18h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 12L20 4L14 20L11 13L4 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 4l1.4 3.6L16 9l-3.6 1.4L11 14l-1.4-3.6L6 9l3.6-1.4L11 4z"
        fill="currentColor"
      />
      <path
        d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M4.5 12H2.1M21.9 12h-2.4M6.2 6.2l-1.7-1.7M19.5 19.5l-1.7-1.7M17.8 6.2l1.7-1.7M4.5 19.5l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 14.2A8.4 8.4 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12h6M9 15.5h6M9 8.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SourcePill({ source, index }) {
  return (
    <a className="source-pill" href={source.url} target="_blank" rel="noreferrer">
      <span className="source-pill__tag">{String(index + 1).padStart(2, "0")}</span>
      <span className="source-pill__title">{source.title}</span>
    </a>
  );
}

function TypingIndicator() {
  return (
    <div className="typing" aria-hidden="true">
      <span className="typing__dot" />
      <span className="typing__dot" />
      <span className="typing__dot" />
    </div>
  );
}

function Avatar({ role }) {
  return role === "user" ? (
    <div className="avatar avatar--user">You</div>
  ) : (
    <div className="avatar avatar--assistant">
      <BotIcon />
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row--user" : "message-row--assistant"}`}>
      <Avatar role={message.role} />
      <div className="message">
        <div className="message__bubble">
          {message.pending ? (
            <>
              <TypingIndicator />
              <span className="message__pending-label">Looking this up in the docs…</span>
            </>
          ) : message.error ? (
            <span className="message__error">{message.text}</span>
          ) : isUser ? (
            <span className="message__text">{message.text}</span>
          ) : (
            <div className="message__markdown">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="source-list">
            {message.sources.map((s, i) => (
              <SourcePill key={s.url} source={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ onAsk, messageCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__blob" aria-hidden="true" />

      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true">
          <BotIcon />
        </span>
        <div>
          <h1 className="sidebar__title">Freight Support Assistant</h1>
          <p className="sidebar__tagline">Internal knowledge assistant</p>
        </div>
      </div>

      <p className="sidebar__desc">
        Ask anything about our booking APIs, known issues, and internal workflows. Every
        answer is grounded in our Confluence documentation and cited at the source.
      </p>

      <div className="sidebar__section">
        <h2 className="sidebar__section-title">
          <SparkIcon /> Try asking
        </h2>
        <ul className="sidebar__topics">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button
                className="sidebar__topic"
                onClick={() => onAsk(s)}
                type="button"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar__section">
        <h2 className="sidebar__section-title">
          <DocIcon /> Synced documentation
        </h2>
        <ul className="sidebar__docs">
          {SYNCED_DOCS.map((d) => (
            <li key={d} className="sidebar__doc">
              <DocIcon />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar__footer">
        <span className="sidebar__footer-dot" />
        {messageCount > 0 ? `${messageCount} message${messageCount === 1 ? "" : "s"} this session` : "Powered by Claude"}
      </div>
    </aside>
  );
}

function getInitialTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function sendQuestion(question) {
    if (!question || isSending) return;

    const userMessage = { role: "user", text: question, id: crypto.randomUUID() };
    const pendingId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", pending: true, id: pendingId },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { role: "assistant", text: data.answer, sources: data.sources || [], id: pendingId }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? {
                role: "assistant",
                text: err.message || "Couldn't reach the assistant. Check that the backend is running.",
                error: true,
                id: pendingId,
              }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSend() {
    sendQuestion(input.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="layout">
      <Sidebar onAsk={sendQuestion} messageCount={messages.length} />

      <div className="app">
        <header className="app__header">
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
            type="button"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="app__status">
            <span className="app__status-dot" />
            Online
          </div>
        </header>

        <main className="app__thread" ref={scrollRef}>
          <div className="app__container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__orb">
                  <BotIcon />
                </div>
                <h2>Ask about a known issue or API.</h2>
                <p>Get grounded answers with citations, pulled straight from our Confluence docs.</p>
              </div>
            ) : (
              messages.map((m) => <Message key={m.id} message={m} />)
            )}
          </div>
        </main>

        <footer className="app__composer">
          <div className="app__container">
            <div className="app__composer-bar">
              <textarea
                ref={textareaRef}
                className="app__input"
                placeholder="Ask a question about our internal docs…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="app__send"
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                aria-label="Send"
                type="button"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
