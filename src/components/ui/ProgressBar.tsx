// src/components/ui/ProgressBar.tsx
"use client";
import { colors } from "@/config/brand";

export default function ProgressBar({
  value,
  max,
  color,
  showLabel = true,
}: {
  value: number;
  max: number;
  color: string;
  showLabel?: boolean;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        {showLabel && (
          <span style={{ fontSize: 13, color: colors.muted }}>
            {value}/{max}
          </span>
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 10,
          background: "#EDE8E3",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 10,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            width: `${pct}%`,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}