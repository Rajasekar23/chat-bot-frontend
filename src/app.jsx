import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/ask";

function SourcePill({ source, index }) {
  return (
    <a
      className="source-pill"
      href={source.url}
      target="_blank"
      rel="noreferrer"
    >
      <span className="source-pill__tag">SRC {String(index + 1).padStart(2, "0")}</span>
      <span className="source-pill__title">{source.title}</span>
    </a>
  );
}

function RouteLoader() {
  return (
    <div className="route-loader" aria-hidden="true">
      <div className="route-loader__track">
        <div className="route-loader__dot" />
      </div>
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message ${isUser ? "message--user" : "message--assistant"}`}>
      <div className="message__bubble">
        {message.pending ? (
          <>
            <RouteLoader />
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
  );
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
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

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark" aria-hidden="true" />
          <div>
            <h1 className="app__title">Freight Support Assistant</h1>
            <p className="app__subtitle">Answers sourced from internal documentation</p>
          </div>
        </div>
        <div className="app__status">
          <span className="app__status-dot" />
          Connected
        </div>
      </header>

      <main className="app__thread" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Ask about a known issue or API.</h2>
            <p>
              Try: <em>&ldquo;How do I fix the refresh token issue?&rdquo;</em> or{" "}
              <em>&ldquo;What does the Booking API expect?&rdquo;</em>
            </p>
          </div>
        ) : (
          messages.map((m) => <Message key={m.id} message={m} />)
        )}
      </main>

      <footer className="app__composer">
        <textarea
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
        >
          Send
        </button>
      </footer>
    </div>
  );
}