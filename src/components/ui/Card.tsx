// src/components/ui/Card.tsx
"use client";
import { colors } from "@/config/brand";
import type { CSSProperties, ReactNode } from "react";

export default function Card({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: colors.warmWhite,
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: "0 2px 12px rgba(139,109,92,0.08)",
        border: "1px solid #EDE8E3",
        ...style,
      }}
    >
      {children}
    </div>
  );
}