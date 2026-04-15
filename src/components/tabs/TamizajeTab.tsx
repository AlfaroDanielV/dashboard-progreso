// src/components/tabs/TamizajeTab.tsx
"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";
import { colors, fonts } from "@/config/brand";
import type { TamizajeEvaluation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  tamizaje: TamizajeEvaluation[];
  patientFirstName: string;
}

// CAS classification from score
function casClassify(score: number | null): { label: string; color: string; bg: string } {
  if (score === null || score === undefined) {
    return { label: "Sin datos", color: colors.muted, bg: "#F5F0EB" };
  }
  if (score >= 30) return { label: "Ausencia de deterioro", color: colors.sage, bg: colors.lightSage };
  if (score >= 24) return { label: "Deterioro leve", color: colors.gold, bg: "#FFF3D0" };
  if (score >= 16) return { label: "Deterioro moderado", color: colors.terracotta, bg: colors.lightTerra };
  if (score >= 9) return { label: "Deterioro acusado", color: colors.terracotta, bg: "#F5D5C8" };
  return { label: "Deterioro grave", color: "#8B3A2A", bg: "#F0C0B0" };
}

// Safe value or 0 for charts
function v(n: number | null): number {
  return n ?? 0;
}

// Radar: 3 CAS domains normalized to %
function buildRadarData(ev: TamizajeEvaluation) {
  return [
    {
      area: "Info./Orientacion",
      valor: Math.min(Math.round((v(ev.informacionOrientacion) / 12) * 100), 100),
      score: v(ev.informacionOrientacion),
      max: 12,
      fullMark: 100,
    },
    {
      area: "Hab. Mental",
      valor: Math.min(Math.round((v(ev.habilidadMental) / 11) * 100), 100),
      score: v(ev.habilidadMental),
      max: 11,
      fullMark: 100,
    },
    {
      area: "Psicomotricidad",
      valor: Math.min(Math.round((v(ev.psicomotricidad) / 12) * 100), 100),
      score: v(ev.psicomotricidad),
      max: 12,
      fullMark: 100,
    },
  ];
}

// All 7 scored sections with max scores
function buildBarData(ev: TamizajeEvaluation) {
  return [
    { name: "Info./Orientacion", score: v(ev.informacionOrientacion), max: 12 },
    { name: "Hab. Mental", score: v(ev.habilidadMental), max: 11 },
    { name: "Psicomotricidad", score: v(ev.psicomotricidad), max: 12 },
    { name: "Denominacion", score: v(ev.denominacion), max: 8 },
    { name: "Repeticion", score: v(ev.repeticion), max: 4 },
    { name: "Comprension", score: v(ev.comprension), max: 5 },
    { name: "Dibujo del reloj", score: v(ev.dibujoReloj), max: 10 },
  ];
}

// Radar tooltip
function RadarTooltipContent({ active, payload }: { active?: boolean; payload?: { payload: { area: string; score: number; max: number; valor: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "white", border: "1px solid #EDE8E3", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: fonts.body, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: colors.dark, marginBottom: 2 }}>{d.area}</div>
      <div style={{ color: colors.muted }}>{d.score} / {d.max} ({d.valor}%)</div>
    </div>
  );
}


export default function TamizajeTab({ tamizaje, patientFirstName }: Props) {
  if (tamizaje.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center" }}>
          Aun no hay evaluaciones de Tamizaje Cognitivo registradas. Los datos
          apareceran aqui despues de la primera evaluacion.
        </p>
      </Card>
    );
  }

  // tamizaje is sorted desc (most recent first)
  const ev = tamizaje[0];
  const cas = casClassify(ev.gradoDeterioroCognitivo);
  const radarData = buildRadarData(ev);
  const barData = buildBarData(ev);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <SectionTitle
        icon="🧩"
        title={`Evaluacion cognitiva de ${patientFirstName}`}
        subtitle="Resultados del Tamizaje Cognitivo (Escala CAS + NEUROPSI)"
      />

      {tamizaje.length > 1 && (
        <p style={{ fontSize: 13, color: colors.muted, margin: "-12px 0 0", lineHeight: 1.5 }}>
          Mostrando la evaluacion mas reciente ({formatDate(ev.fecha)}).
        </p>
      )}

      {/* 3A: CAS Result Card */}
      <Card style={{ background: cas.bg, border: `2px solid ${cas.color}44` }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: colors.muted, marginBottom: 12 }}>
          Grado de deterioro cognitivo
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: cas.color, fontFamily: fonts.heading, lineHeight: 1 }}>
              {ev.gradoDeterioroCognitivo ?? "—"}
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>/35</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{
              display: "inline-block",
              background: cas.color,
              color: "white",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 14,
              fontWeight: 700,
            }}>
              {cas.label}
            </div>
            <div style={{ fontSize: 13, color: colors.dark, marginTop: 8, lineHeight: 1.5 }}>
              Evaluado el {formatDate(ev.fecha)}
              {ev.examinador && ` · ${ev.examinador}`}
            </div>
          </div>
        </div>

        {/* CAS sub-scores */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "Orientacion", score: ev.informacionOrientacion, max: 12 },
            { label: "Hab. Mental", score: ev.habilidadMental, max: 11 },
            { label: "Psicomotricidad", score: ev.psicomotricidad, max: 12 },
          ].map((s) => (
            <div key={s.label} style={{ flex: "1 1 80px", background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: cas.color }}>{s.score ?? "—"}</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>de {s.max}</div>
              <div style={{ fontSize: 11, color: colors.dark, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
        Cada area refleja habilidades que se fortalecen con la practica y el acompanamiento.
      </p>

      {/* 3B: Radar Chart — 3 CAS domains */}
      <Card>
        <SectionTitle
          icon="🕸️"
          title="Perfil CAS"
          subtitle="Las 3 areas que componen el puntaje CAS (% del maximo)"
        />
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} cx="50%" cy="50%">
            <PolarGrid stroke="#EDE8E3" />
            <PolarAngleAxis
              dataKey="area"
              tick={{ fontSize: 11, fill: colors.dark, fontFamily: fonts.body }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: colors.muted }}
              tickCount={3}
            />
            <Radar
              name={patientFirstName}
              dataKey="valor"
              stroke={colors.terracotta}
              fill={colors.sage}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip content={<RadarTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: fonts.body }} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* 3C: Bar display — all 7 sections, mobile-friendly */}
      <Card>
        <SectionTitle
          icon="📊"
          title="Puntaje por area"
          subtitle="Resultado obtenido en cada seccion evaluada"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {barData.map((d) => {
            const pct = Math.min(Math.round((d.score / d.max) * 100), 100);
            return (
              <div key={d.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: colors.dark }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.dark }}>{d.score}/{d.max}</span>
                </div>
                <div style={{ height: 10, borderRadius: 6, background: "#EDE8E3" }}>
                  <div style={{ height: "100%", borderRadius: 6, background: colors.sage, width: `${pct}%`, transition: "width 0.3s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3D: Clock Alert */}
      {ev.dibujoReloj !== null && ev.dibujoReloj < 6 ? (
        <Card style={{ background: "#FFF3D0", border: `2px solid ${colors.gold}44` }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>🕐</span>
            <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
              El dibujo del reloj {ev.dibujoReloj}/10sugiere areas de oportunidad en funciones visuoconstructivas y planificacion. Estas habilidades se fortalecen con practica.
            </p>
          </div>
        </Card>
      ) : ev.dibujoReloj !== null ? (
        <Card style={{ background: colors.lightSage, border: `2px solid ${colors.sage}44` }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 24 }}>🕐</span>
            <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
              El dibujo del reloj {ev.dibujoReloj}/10 se encuentra dentro de parametros esperados.
            </p>
          </div>
        </Card>
      ) : null}

      {/* 3E: Observations */}
      {ev.observaciones && ev.observaciones.trim() !== "" && (
        <Card>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: colors.muted, marginBottom: 8 }}>
            Observaciones
          </div>
          <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
            {ev.observaciones}
          </p>
        </Card>
      )}
    </div>
  );
}
