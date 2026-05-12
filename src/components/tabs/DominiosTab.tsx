// src/components/tabs/DominiosTab.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { colors, fonts } from "@/config/brand";
import type { DomainProgress } from "@/lib/types";

interface Props {
  domains: DomainProgress[];
  patientFirstName: string;
}

export default function DominiosTab({ domains }: Props) {
  if (domains.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center" }}>
          Los dominios cognitivos aparecerán aquí después de la primera evaluación.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontSize: 14,
          color: colors.muted,
          margin: "0 0 8px",
          lineHeight: 1.6,
        }}
      >
        Cada área cognitiva es como un músculo: con el ejercicio adecuado, se
        fortalece. Aquí puede ver cómo cada una ha avanzado desde que iniciamos
        juntos.
      </p>

      {domains.map((d) => {
        const change = d.current - d.initial;
        const pctInitial = Math.round((d.initial / d.max) * 100);
        const pctCurrent = Math.round((d.current / d.max) * 100);
        return (
          <Card key={d.domain}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: 18,
                    margin: 0,
                    color: colors.dark,
                  }}
                >
                  {d.icon} {d.domain}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: colors.muted,
                    margin: "4px 0 0",
                  }}
                >
                  {d.desc}
                </p>
              </div>
              <div
                style={{
                  background: change > 0 ? colors.lightSage : "#FFF3E0",
                  color: change > 0 ? colors.sage : colors.gold,
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {change >= 0 ? "+" : ""}
                {change} pts
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    marginBottom: 4,
                  }}
                >
                  Inicio: {d.initial}/{d.max} ({pctInitial}%)
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 6,
                    background: "#EDE8E3",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 6,
                      background: colors.peach,
                      width: `${pctInitial}%`,
                    }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 18, color: colors.muted }}>→</div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.sage,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Actual: {d.current}/{d.max} ({pctCurrent}%)
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 6,
                    background: "#EDE8E3",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 6,
                      background: colors.sage,
                      width: `${pctCurrent}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Card>
        <SectionTitle icon="📊" title="Comparación por dominio" />
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={domains.map((d) => ({
              name: d.domain.slice(0, 5) + ".",
              inicial: d.initial,
              actual: d.current,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.muted }}
            />
            <YAxis tick={{ fontSize: 11, fill: colors.muted }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="inicial"
              fill={colors.peach}
              name="Inicio"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              fill={colors.sage}
              name="Actual"
              radius={[4, 4, 0, 0]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
