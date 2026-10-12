"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  askAssistantAction,
  clearAssistantChatAction,
} from "@/actions/assistant";

const initialState = {
  answer: "",
  error: "",
};

function normalizeHistoryItem(item) {
  if (!item || typeof item !== "object") return null;

  const role = item.role;
  if (role === "user" || role === "assistant") {
    const content = Array.isArray(item.content) ? item.content : [];
    const text = content
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object") {
          if (entry.type === "input_text" || entry.type === "output_text") {
            return entry.text || "";
          }
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    if (text) {
      return { role, text };
    }
  }

  if (typeof item.text === "string") {
    return { role: item.role || "assistant", text: item.text };
  }

  return null;
}

function normalizeHistory(items = []) {
  return items.map(normalizeHistoryItem).filter(Boolean);
}

export default function AssistantForm({ initialMessages = [] }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() =>
    normalizeHistory(initialMessages),
  );
  const latestPromptRef = useRef("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [state, formAction, isPending] = useActionState(
    askAssistantAction,
    initialState,
  );

  // עדכון רשימת ההודעות כאשר מתקבלת תשובה מהסוכן
  useEffect(() => {
    if (!state.answer) return;

    const prompt = latestPromptRef.current.trim();
    setMessages((prev) => {
      const next = [...prev];
      if (prompt) {
        next.push({ role: "user", text: prompt });
      }
      next.push({ role: "assistant", text: state.answer });
      return next;
    });

    latestPromptRef.current = "";
    setDraft("");
  }, [state.answer]);

  // גלילה אוטומטית למטה כשנוספות הודעות או שיש שגיאה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!messages.length) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages, state.error]);

  const canShowChat = messages.length > 0 || state.error || state.answer;

  return (
    <div
      className={`flex ${
        canShowChat ? "max-h-[60vh] min-h-40" : "h-40"
      } flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <div className="text-sm font-bold text-slate-800">צ&apos;אט הספרייה</div>
          <div className="text-[11px] text-slate-500">המלצות לפי הטעם שלך</div>
        </div>

        <form action={clearAssistantChatAction}>
          <button
            type="submit"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            onClick={() => {
              setMessages([]);
              setDraft("");
              latestPromptRef.current = "";
              requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              });
            }}
          >
            נקה שיחה
          </button>
        </form>
      </div>

      {canShowChat && (
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    isUser
                      ? "bg-primary text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <div
                    className={`mb-1 text-[10px] font-bold tracking-[0.12em] uppercase ${
                      isUser ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {isUser ? "אתם" : "הסוכן"}
                  </div>
                  <div className="whitespace-pre-line text-sm leading-7">
                    {message.text}
                  </div>
                </div>
              </div>
            );
          })}

          {state.error && (
            <div
              aria-live="polite"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {state.error}
            </div>
          )}

          {/* שימוש ישיר ב-isPending במקום ב-isTyping ו-useEffect מיותר */}
          {isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {!canShowChat && (
        <div className="flex flex-1 items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500">
          עוד לא התחלת שיחה. שאל את הסוכן על הספר הבא שלך.
        </div>
      )}

      <form
        action={formAction}
        className="flex items-end gap-3 border-t border-slate-200 bg-white p-3"
      >
        <textarea
          ref={inputRef}
          id="message"
          name="message"
          rows={1}
          value={draft}
          onChange={(event) => {
            const value = event.target.value;
            setDraft(value);
            latestPromptRef.current = value;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form.requestSubmit();
            }
          }}
          required
          placeholder="כתוב כאן מה תרצה לקרוא..."
          className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-white transition hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isPending ? "…" : "➤"}
        </button>
      </form>
    </div>
  );
}