"use client";
import { useState, useRef, useEffect } from "react";
import { colors, fonts } from "@/config/brand";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  patientContext: string;
  patientName: string;
  pruebas?: string[];
}

const MAX_MESSAGES_PER_SESSION = 20;

export default function ChatBot({ patientContext, patientName, pruebas = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);

    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const firstName = patientName.split(" ")[0];

  const hasTamizaje = pruebas.some((p) =>
    p.toLowerCase().replace(/[-_\s]/g, "").includes("tamizaje")
  );
  const hasACE = pruebas.length === 0 ||
    pruebas.some((p) => p.toLowerCase().replace(/[-_\s]/g, "").includes("ace"));

  const suggestions = [
    ...(hasACE ? [
      `¿Cómo va ${firstName} en memoria?`,
      "¿Qué significa su puntaje en atención?",
    ] : []),
    ...(hasTamizaje ? [
      `¿Qué significa el resultado del tamizaje cognitivo de ${firstName}?`,
      `¿Qué tan bien le fue a ${firstName} en Habilidad Mental?`,
      `¿Qué significa el resultado del reloj?`,
    ] : []),
    "¿Qué ejercicios le toca hacer en casa?",
    "¿Cuándo es la próxima cita?",
  ];

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (messageCount >= MAX_MESSAGES_PER_SESSION) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ha alcanzado el límite de preguntas para esta sesión. Si necesita más información, puede contactar a la Lic. Julisa por WhatsApp.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);
    setMessageCount((prev) => prev + 1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, patientContext }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok
            ? data.response
            : data.error || "Ocurrió un error. Intente de nuevo.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "No se pudo conectar. Verifique su conexión a internet.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Floating button ──
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat"
        style={{
          position: "fixed",
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          width: isMobile ? 52 : 60,
          height: isMobile ? 52 : 60,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.terracotta}, ${colors.sage})`,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          boxShadow: "0 4px 20px rgba(185, 120, 96, 0.4)",
          zIndex: 1000,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(185, 120, 96, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(185, 120, 96, 0.4)";
        }}
      >
        💬
      </button>
    );
  }

  // ── Chat panel ──
  return (
    <div
      style={{
        position: "fixed",
        inset: isMobile ? "12px" : "auto 24px 24px auto",
        width: isMobile ? "calc(100vw - 24px)" : 380,
        maxWidth: isMobile ? "calc(100vw - 24px)" : "calc(100vw - 48px)",
        height: isMobile ? "calc(100vh - 24px)" : 520,
        maxHeight: isMobile ? "calc(100vh - 24px)" : "calc(100vh - 48px)",
        borderRadius: isMobile ? 16 : 20,
        background: "white",
        boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 1000,
        fontFamily: fonts.body,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.terracotta}, ${colors.sage})`,
          padding: isMobile ? "12px 14px" : "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: isMobile ? 15 : 16 }}>
            Asistente de progreso
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 11 : 12, marginTop: 2 }}>
            Pregunte sobre el avance de {firstName}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar chat"
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            color: "white",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? 12 : 16,
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 10 : 12,
          background: colors.cream,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: colors.muted,
              fontSize: isMobile ? 13 : 14,
              padding: isMobile ? "20px 12px" : "32px 16px",
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: isMobile ? 28 : 32, marginBottom: 12 }}></div>
            ¡Hola! Soy el asistente de Terapia del Lenguaje. Puede preguntarme
            sobre el progreso de {firstName} — por ejemplo:
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "8px 14px",
                    fontSize: isMobile ? 14 : 13,
                    color: colors.terracotta,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: fonts.body,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FFF8F5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: isMobile ? "92%" : "80%",
              padding: isMobile ? "9px 12px" : "10px 14px",
              borderRadius:
                msg.role === "user"
                  ? "16px 16px 4px 16px"
                  : "16px 16px 16px 4px",
              background: msg.role === "user" ? colors.terracotta : "white",
              color: msg.role === "user" ? "white" : colors.dark,
              fontSize: isMobile ? 15 : 14,
              lineHeight: 1.5,
              boxShadow:
                msg.role === "assistant"
                  ? "0 1px 4px rgba(0,0,0,0.06)"
                  : "none",
            }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div
            style={{
              alignSelf: "flex-start",
              background: "white",
              padding: isMobile ? "9px 12px" : "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              fontSize: isMobile ? 15 : 14,
              color: colors.muted,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            Pensando...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: isMobile ? "10px 12px" : "12px 16px",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          gap: 8,
          background: "white",
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Escriba su pregunta..."
          maxLength={500}
          disabled={isLoading}
          style={{
            flex: 1,
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: isMobile ? "12px 12px" : "10px 14px",
            fontSize: 16,
            outline: "none",
            fontFamily: fonts.body,
            transition: "border-color 0.2s",
            minHeight: 44,
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = colors.terracotta)
          }
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          aria-label="Enviar"
          style={{
            background:
              isLoading || !input.trim() ? "#E5E7EB" : colors.terracotta,
            color: "white",
            border: "none",
            borderRadius: 12,
            width: isMobile ? 46 : 44,
            height: isMobile ? 46 : 44,
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          ↑
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: isMobile ? "4px 12px 8px" : "6px 16px 10px",
          textAlign: "center",
          fontSize: isMobile ? 10 : 11,
          color: "#C0B8B0",
          background: "white",
        }}
      >
        {messageCount}/{MAX_MESSAGES_PER_SESSION} preguntas · Ante dudas
        clínicas, consulte a la Lic. Julisa
      </div>
    </div>
  );
}
