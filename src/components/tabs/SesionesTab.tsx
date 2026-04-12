// src/components/tabs/SesionesTab.tsx
"use client";
import Card from "@/components/ui/Card";
import { colors } from "@/config/brand";
import type { Session } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  sessions: Session[];
  patientFirstName: string;
}

function getSessionMood(session: Session): "celebration" | "positive" | "neutral" {
  const obs = (session.observations || "").toLowerCase();
  if (
    obs.includes("mejoría") ||
    obs.includes("logró") ||
    obs.includes("excelente") ||
    obs.includes("🎉") ||
    session.area === "Integral"
  ) {
    return "celebration";
  }
  if (
    obs.includes("mejoró") ||
    obs.includes("bien") ||
    obs.includes("avance") ||
    obs.includes("correctamente")
  ) {
    return "positive";
  }
  return "neutral";
}

export default function SesionesTab({ sessions, patientFirstName }: Props) {
  if (sessions.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center" }}>
          Las sesiones aparecerán aquí a medida que avancemos juntos.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p
        style={{
          fontSize: 14,
          color: colors.muted,
          margin: "0 0 8px",
          lineHeight: 1.6,
        }}
      >
        Cada sesión es un paso adelante. Aquí puede ver lo que hemos trabajado
        y los avances que {patientFirstName} ha logrado.
      </p>

      {sessions.map((s) => {
        const mood = getSessionMood(s);
        const borderColor =
          mood === "celebration"
            ? colors.gold
            : mood === "positive"
            ? colors.sage
            : colors.peach;

        return (
          <Card
            key={s.sessionNumber}
            style={{
              borderLeft: `4px solid ${borderColor}`,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    background: colors.terracotta,
                    color: "white",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {s.sessionNumber}
                </span>
                <span style={{ fontSize: 13, color: colors.muted }}>
                  {formatDate(s.date)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.sage,
                  background: colors.lightSage,
                  borderRadius: 12,
                  padding: "4px 12px",
                }}
              >
                {s.area}
              </span>
            </div>
            <p
              style={{
                fontSize: 14,
                color: colors.dark,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {mood === "celebration" && "🎉 "}
              {s.observations || s.activities || s.objectives}
            </p>
          </Card>
        );
      })}
    </div>
  );
}