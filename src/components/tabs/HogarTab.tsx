// src/components/tabs/HogarTab.tsx
"use client";
import Card from "@/components/ui/Card";
import { colors, fonts } from "@/config/brand";
import type { Recommendation } from "@/lib/types";

interface Props {
  recommendations: Recommendation[];
  patientFirstName: string;
  whatsappUrl: string;
}

export default function HogarTab({
  recommendations,
  patientFirstName,
  whatsappUrl,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card
        style={{
          background: `linear-gradient(135deg, ${colors.lightSage}66, ${colors.cream})`,
        }}
      >
        <p
          style={{
            fontSize: 14,
            color: colors.dark,
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          La terapia no termina en la sesión. Estas actividades son
          oportunidades para
          <strong> compartir momentos significativos juntos</strong> mientras
          fortalecen las habilidades que estamos trabajando. No se trata de
          &ldquo;hacer tarea&rdquo; — se trata de conectar.
        </p>
      </Card>

      {recommendations.length === 0 ? (
        <Card>
          <p style={{ color: colors.muted, textAlign: "center" }}>
            Las recomendaciones para el hogar aparecerán aquí próximamente.
          </p>
        </Card>
      ) : (
        recommendations.map((r, i) => (
          <Card key={i}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: colors.sage,
                  background: colors.lightSage,
                  borderRadius: 12,
                  padding: "4px 14px",
                }}
              >
                {r.area}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: colors.terracotta,
                  fontWeight: 600,
                  background: colors.lightTerra,
                  borderRadius: 12,
                  padding: "4px 14px",
                }}
              >
                {r.frequency}
              </span>
            </div>
            <p
              style={{
                fontSize: 15,
                color: colors.dark,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {r.activity}
            </p>
          </Card>
        ))
      )}

      <Card
        style={{
          background: colors.warmWhite,
          border: `2px dashed ${colors.peach}`,
        }}
      >
        <h3
          style={{
            fontFamily: fonts.heading,
            fontSize: 18,
            color: colors.terracotta,
            margin: "0 0 12px",
          }}
        >
          📞 ¿Tiene dudas o quiere compartir un avance?
        </h3>
        <p
          style={{
            fontSize: 14,
            color: colors.dark,
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Escríbanos por WhatsApp en cualquier momento. Nos encanta saber cómo
          va {patientFirstName} entre sesiones. Cada avance, por pequeño que
          parezca, es importante para nosotros.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            marginTop: 16,
            background: colors.sage,
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: fonts.body,
            width: "100%",
            textAlign: "center",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          💬 Escribir por WhatsApp
        </a>
      </Card>
    </div>
  );
}
