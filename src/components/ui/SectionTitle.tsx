// src/components/ui/SectionTitle.tsx
"use client";
import { colors, fonts } from "@/config/brand";

export default function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        style={{
          fontFamily: fonts.heading,
          fontSize: 22,
          fontWeight: 700,
          color: colors.dark,
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {icon && <span style={{ fontSize: 24 }}>{icon}</span>}
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 14,
            color: colors.muted,
            margin: "6px 0 0",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}