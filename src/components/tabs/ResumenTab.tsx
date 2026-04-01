// src/components/tabs/ResumenTab.tsx
"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
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
import type { ACEEvaluation, DomainProgress, Victory } from "@/lib/types";

interface Props {
  evaluations: ACEEvaluation[];
  domains: DomainProgress[];
  victories: Victory[];
}

export default function ResumenTab({ evaluations, domains, victories }: Props) {
  if (evaluations.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center" }}>
          Aún no hay evaluaciones registradas. Los datos aparecerán aquí después
          de la primera evaluación.
        </p>
      </Card>
    );
  }

  const initial = evaluations[0];
  const current = evaluations[evaluations.length - 1];

  // Radar data
  const radarCombined = domains.map((d) => ({
    domain: d.domain,
    inicial: Math.round((d.initial / d.max) * 100),
    actual: Math.round((d.current / d.max) * 100),
    fullMark: 100,
  }));

  // Line chart data
  const lineData = evaluations.map((ev) => ({
    name: ev.type,
    date: ev.date,
    total: ev.totalACE,
  }));

  const latestVictory = victories.length > 0 ? victories[0] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card>
        <SectionTitle
          icon="📊"
          title="Perfil cognitivo"
          subtitle="Comparación entre la evaluación inicial y la más reciente"
        />
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarCombined} cx="50%" cy="50%">
            <PolarGrid stroke="#EDE8E3" />
            <PolarAngleAxis
              dataKey="domain"
              tick={{
                fontSize: 12,
                fill: colors.dark,
                fontFamily: fonts.body,
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: colors.muted }}
            />
            <Radar
              name="Inicial"
              dataKey="inicial"
              stroke={colors.peach}
              fill={colors.peach}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Actual"
              dataKey="actual"
              stroke={colors.sage}
              fill={colors.sage}
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: fonts.body }}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div
          style={{
            background: colors.lightSage,
            borderRadius: 12,
            padding: "14px 18px",
            marginTop: 12,
            fontSize: 14,
            color: colors.dark,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: colors.sage }}>
            Lo que esto significa:
          </strong>{" "}
          {evaluations.length > 1
            ? "En todas las áreas evaluadas hay mejoría. Los avances más notables reflejan mayor capacidad para seguir conversaciones y expresarse con claridad."
            : "Esta es la línea base. A medida que avancemos, veremos cómo cada área se fortalece."}
        </div>
      </Card>

      <Card>
        <SectionTitle
          icon="📈"
          title="Evolución general"
          subtitle="Puntaje total ACE-III a lo largo del tiempo"
        />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: colors.muted }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: colors.muted }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                fontFamily: fonts.body,
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={colors.terracotta}
              strokeWidth={3}
              dot={{ fill: colors.terracotta, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {latestVictory && (
        <Card
          style={{
            background: `linear-gradient(135deg, ${colors.lightSage}88, ${colors.cream})`,
            border: `2px solid ${colors.sage}44`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: colors.sage,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            🏆 Victoria reciente
          </div>
          <p
            style={{
              fontSize: 16,
              color: colors.dark,
              margin: 0,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &ldquo;{latestVictory.text}&rdquo;
          </p>
          <div
            style={{
              fontSize: 13,
              color: colors.muted,
              marginTop: 8,
            }}
          >
            {latestVictory.date} · {latestVictory.area}
          </div>
        </Card>
      )}
    </div>
  );
}