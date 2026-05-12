// src/components/tabs/VictoriasTab.tsx
"use client";
import Card from "@/components/ui/Card";
import { colors, fonts } from "@/config/brand";
import type { Victory } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  victories: Victory[];
  patientFirstName: string;
}

export default function VictoriasTab({ victories, patientFirstName }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        style={{
          background: `linear-gradient(135deg, ${colors.cream}, ${colors.lightSage}44)`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            color: colors.dark,
            margin: 0,
            lineHeight: 1.6,
            textAlign: "center",
            fontStyle: "italic",
            padding: "8px 0",
          }}
        >
          &ldquo;Las pequeñas victorias son inmensamente grandes. Cada logro es
          una puerta que se abre hacia una vida más plena.&rdquo;
        </p>
      </Card>

      {victories.length === 0 ? (
        <Card>
          <p style={{ color: colors.muted, textAlign: "center" }}>
            Las victorias se documentarán aquí a medida que {patientFirstName}{" "}
            las vaya logrando. ¡Cada paso cuenta!
          </p>
        </Card>
      ) : (
        victories.map((v, i) => (
          <Card
            key={i}
            style={{
              borderLeft: `4px solid ${colors.gold}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 15,
                    color: colors.dark,
                    margin: "0 0 8px",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  ⭐ {v.text}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 13,
                    color: colors.muted,
                  }}
                >
                  <span>{formatDate(v.date)}</span>
                  <span
                    style={{
                      background: colors.lightSage,
                      color: colors.sage,
                      borderRadius: 8,
                      padding: "2px 10px",
                      fontWeight: 600,
                    }}
                  >
                    {v.area}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      <div
        style={{
          textAlign: "center",
          padding: 20,
          fontSize: 14,
          color: colors.muted,
          fontStyle: "italic",
        }}
      >
        Cada victoria aquí documentada es un paso más hacia la autonomía y la
        conexión que {patientFirstName} merece.
      </div>
    </div>
  );
}
