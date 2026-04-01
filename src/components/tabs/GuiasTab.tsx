"use client";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { colors, fonts } from "@/config/brand";
import type { Guide } from "@/lib/types";

interface Props {
  guides: Guide[];
}

export default function GuiasTab({ guides }: Props) {
  if (!guides || guides.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center", padding: "20px 0" }}>
          No hay guías asignadas aún. Cuando la terapeuta suba material,
          aparecerá aquí.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle
        icon="📚"
        title="Guías y material de apoyo"
        subtitle="Material para trabajar en casa con su ser querido"
      />
      {guides.map((guia) => {
        const hasUrl = !!guia.archivoUrl;
        const Tag = hasUrl ? "a" : "div";
        return (
          <Tag
            key={guia.id}
            {...(hasUrl ? { href: guia.archivoUrl, target: "_blank", rel: "noopener noreferrer" } : {})}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: 20,
              background: "white",
              borderRadius: 16,
              border: "1px solid #E5E7EB",
              textDecoration: "none",
              cursor: hasUrl ? "pointer" : "default",
              opacity: hasUrl ? 1 : 0.7,
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: colors.cream, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 24, flexShrink: 0,
            }}>
              📄
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: fonts.body, fontWeight: 600,
                fontSize: 16, color: colors.dark,
              }}>
                {guia.titulo}
              </div>
              {guia.descripcion && (
                <div style={{
                  fontSize: 14, color: colors.muted, marginTop: 4,
                }}>
                  {guia.descripcion}
                </div>
              )}
              {guia.fecha && (
                <div style={{
                  fontSize: 12, color: "#9CA3AF", marginTop: 4,
                }}>
                  {new Date(guia.fecha).toLocaleDateString("es-CR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </div>
              )}
              {!hasUrl && (
                <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                  Archivo no disponible aún
                </div>
              )}
            </div>
            {hasUrl && (
              <div style={{
                color: colors.terracotta, fontSize: 20, flexShrink: 0,
              }}>
                →
              </div>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
