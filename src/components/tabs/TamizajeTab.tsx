// src/components/tabs/TamizajeTab.tsx
"use client";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LineChart,
  Line,
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

// ── CAS classification helpers ──
// Ranges from the actual test form:
//   A: 35-30 | B: 29-24 | C: 23-16 | D: 15-9 | E: 8-0
function casLetter(clasificacion: string): string {
  return clasificacion.trim().charAt(0).toUpperCase();
}

function casColor(clasificacion: string): string {
  const l = casLetter(clasificacion);
  if (l === "A") return colors.sage;
  if (l === "B") return colors.gold;
  if (l === "C") return "#E8893A";
  return colors.terracotta; // D, E
}

function casBackground(clasificacion: string): string {
  const l = casLetter(clasificacion);
  if (l === "A") return colors.lightSage;
  if (l === "B") return "#FFF3D0";
  if (l === "C") return "#FDE8CC";
  return "#F5D5C8"; // D, E
}

// ── 7 categories for all charts ──
// Denominación Verbo-Verbal (frutas + palabras M) has no official max.
// For the radar we express it as a raw score on its own axis (domain [0, max of axis]).
// For the bar chart we show the raw count without a max reference bar.

function buildRadarData(ev: TamizajeEvaluation) {
  return [
    {
      area: "Info./Orientación",
      valor: Math.round((ev.io.total / 12) * 100),
      max: 12,
      score: ev.io.total,
      fullMark: 100,
    },
    {
      area: "Hab. Mental",
      valor: Math.round((ev.hm.total / 11) * 100),
      max: 11,
      score: ev.hm.total,
      fullMark: 100,
    },
    {
      area: "Psicomotric.",
      valor: Math.round((ev.pm.laberintoPts / 12) * 100),
      max: 12,
      score: ev.pm.laberintoPts,
      fullMark: 100,
    },
    {
      area: "Denom. Viso-Verbal",
      valor: Math.round(((ev.lenguaje.visoVerbalLamina + ev.lenguaje.visoVerbalObjetos) / 16) * 100),
      max: 16,
      score: ev.lenguaje.visoVerbalLamina + ev.lenguaje.visoVerbalObjetos,
      fullMark: 100,
    },
    {
      // No official max — show as % of a practical ref of 20 so the shape is meaningful
      area: "Denom. Verbo-Verbal",
      valor: Math.min(Math.round(((ev.lenguaje.frutasTotal + ev.lenguaje.palabrasMTotal) / 20) * 100), 100),
      max: null,
      score: ev.lenguaje.frutasTotal + ev.lenguaje.palabrasMTotal,
      fullMark: 100,
    },
    {
      area: "Repetición",
      valor: Math.round((ev.lenguaje.repeticionTotal / 4) * 100),
      max: 4,
      score: ev.lenguaje.repeticionTotal,
      fullMark: 100,
    },
    {
      area: "Comprensión",
      valor: Math.round((ev.lenguaje.comprensionTotal / 5) * 100),
      max: 5,
      score: ev.lenguaje.comprensionTotal,
      fullMark: 100,
    },
  ];
}

// ── Bar chart: same 7 categories ──
function buildBarData(ev: TamizajeEvaluation) {
  return [
    { name: "Info./Orientación",    score: ev.io.total,    max: 12,   gold: false },
    { name: "Hab. Mental",          score: ev.hm.total,    max: 11,   gold: false },
    { name: "Psicomotricidad",      score: ev.pm.laberintoPts, max: 12, gold: false },
    { name: "Denom. Viso-Verbal",   score: ev.lenguaje.visoVerbalLamina + ev.lenguaje.visoVerbalObjetos, max: 16, gold: false },
    { name: "Denom. Verbo-Verbal",  score: ev.lenguaje.frutasTotal + ev.lenguaje.palabrasMTotal, max: null, gold: true },
    { name: "Repetición",           score: ev.lenguaje.repeticionTotal, max: 4,  gold: false },
    { name: "Comprensión",          score: ev.lenguaje.comprensionTotal, max: 5, gold: false },
  ];
}

// Custom tooltip for bar chart
function BarTooltipContent({ active, payload }: { active?: boolean; payload?: { payload: { name: string; score: number; max: number | null } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "white", border: "1px solid #EDE8E3", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: fonts.body, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: colors.dark, marginBottom: 2 }}>{d.name}</div>
      <div style={{ color: colors.muted }}>
        {d.max != null ? `${d.score} / ${d.max} puntos` : `${d.score} palabras`}
      </div>
    </div>
  );
}

// Custom tooltip for radar chart
function RadarTooltipContent({ active, payload }: { active?: boolean; payload?: { payload: { area: string; score: number; max: number | null; valor: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "white", border: "1px solid #EDE8E3", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontFamily: fonts.body, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: colors.dark, marginBottom: 2 }}>{d.area}</div>
      <div style={{ color: colors.muted }}>
        {d.max != null ? `${d.score} / ${d.max} (${d.valor}%)` : `${d.score} palabras`}
      </div>
    </div>
  );
}

export default function TamizajeTab({ tamizaje, patientFirstName }: Props) {
  if (tamizaje.length === 0) {
    return (
      <Card>
        <p style={{ color: colors.muted, textAlign: "center" }}>
          Aún no hay evaluaciones de Tamizaje Cognitivo registradas. Los datos
          aparecerán aquí después de la primera evaluación.
        </p>
      </Card>
    );
  }

  if (tamizaje.length >= 2) {
    return <TamizajeComparison tamizaje={tamizaje} patientFirstName={patientFirstName} />;
  }

  const ev = tamizaje[0];
  const color = casColor(ev.cas.clasificacion);
  const bgColor = casBackground(ev.cas.clasificacion);
  const radarData = buildRadarData(ev);
  const barData = buildBarData(ev);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── CAS Result Card ── */}
      <Card style={{ background: bgColor, border: `2px solid ${color}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color, fontFamily: fonts.heading, lineHeight: 1 }}>
              {ev.cas.total}
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>de 35 pts</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: colors.muted, marginBottom: 6 }}>
              Resultado CAS
            </div>
            <div style={{ display: "inline-block", background: color, color: "white", borderRadius: 20, padding: "6px 16px", fontSize: 14, fontWeight: 700 }}>
              {ev.cas.clasificacion || "Sin clasificación"}
            </div>
            <div style={{ fontSize: 13, color: colors.dark, marginTop: 8, lineHeight: 1.5 }}>
              Evaluado el {formatDate(ev.fecha)}
              {ev.examinador && ` · ${ev.examinador}`}
            </div>
          </div>
        </div>

        {/* CAS sub-scores that make up the total */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "Orientación", score: ev.io.total, max: 12 },
            { label: "Hab. Mental", score: ev.hm.total, max: 11 },
            { label: "Psicomotricidad", score: ev.pm.laberintoPts, max: 12 },
          ].map((s) => (
            <div key={s.label} style={{ flex: "1 1 80px", background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color }}>{s.score}</div>
              <div style={{ fontSize: 10, color: colors.muted, marginTop: 1 }}>de {s.max}</div>
              <div style={{ fontSize: 11, color: colors.dark, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Radar: 7 categorías ── */}
      <Card>
        <SectionTitle
          icon="🕸️"
          title="Perfil cognitivo"
          subtitle="Desempeño en las 7 áreas principales de la prueba"
        />
        <ResponsiveContainer width="100%" height={300}>
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
              fill={colors.terracotta}
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip content={<RadarTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: fonts.body }} />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ background: colors.lightSage, borderRadius: 12, padding: "14px 18px", marginTop: 12, fontSize: 14, color: colors.dark, lineHeight: 1.6 }}>
          <strong style={{ color: colors.sage }}>Lo que esto significa: </strong>
          Cada eje es una habilidad diferente. Las áreas más pequeñas son las que
          trabajaremos con más atención — y con práctica, cada una puede crecer.
          Si quiere saber más sobre alguna área específica, puede preguntarle al asistente.
        </div>
      </Card>

      {/* ── Bar chart: 7 categorías ── */}
      <Card>
        <SectionTitle
          icon="📊"
          title="Puntaje por área"
          subtitle="Resultado obtenido vs. máximo posible"
        />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 120, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: colors.muted }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: colors.dark }}
              width={118}
            />
            <Tooltip content={<BarTooltipContent />} />
            {/* Max bar — only renders for sections with a fixed max */}
            <Bar dataKey="max" name="Máximo" radius={[0, 4, 4, 0]} barSize={14}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.max != null ? "#EDE8E3" : "transparent"} />
              ))}
            </Bar>
            {/* Score bar */}
            <Bar dataKey="score" name="Puntaje obtenido" radius={[0, 4, 4, 0]} barSize={14}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.gold ? colors.gold : colors.sage} />
              ))}
            </Bar>
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: fonts.body }}
              formatter={(value: string) => value === "Máximo" ? "Puntaje máximo" : "Puntaje obtenido"}
            />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 12, color: colors.muted, marginTop: 8, lineHeight: 1.5 }}>
          La <span style={{ color: colors.gold, fontWeight: 600 }}>Denominación Verbo-Verbal</span> (palabras generadas) no tiene máximo oficial — más es siempre mejor.
        </div>
      </Card>

      {/* ── Reloj alert ── */}
      {ev.reloj.sospechaDeficit && (
        <Card style={{ background: "#FFF3E0", border: "2px solid #E8893A44" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#C67B2A", fontSize: 15, marginBottom: 6 }}>
                Nota sobre el dibujo del reloj
              </div>
              <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
                El resultado del dibujo del reloj ({ev.reloj.total}/10) es igual o menor a 6, lo que
                según la prueba sugiere posible déficit cognitivo en funciones visuoespaciales y de
                planificación. Esto será evaluado en detalle por la terapeuta.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Multi-evaluation comparison ──
function TamizajeComparison({
  tamizaje,
  patientFirstName,
}: {
  tamizaje: TamizajeEvaluation[];
  patientFirstName: string;
}) {
  const latest = tamizaje[tamizaje.length - 1];
  const prev = tamizaje[tamizaje.length - 2];
  const casChange = latest.cas.total - prev.cas.total;
  const color = casColor(latest.cas.clasificacion);
  const bgColor = casBackground(latest.cas.clasificacion);

  const lineData = tamizaje.map((ev) => ({
    fecha: formatDate(ev.fecha),
    cas: ev.cas.total,
  }));

  // Radar comparison: latest vs prev
  const radarLatest = buildRadarData(latest);
  const radarPrev = buildRadarData(prev);
  const radarCompare = radarLatest.map((d, i) => ({
    area: d.area,
    anterior: radarPrev[i].valor,
    actual: d.valor,
    scoreAnterior: radarPrev[i].score,
    scoreActual: d.score,
    max: d.max,
    fullMark: 100,
  }));

  const compareRows = [
    { label: "CAS Total",               prev: `${prev.cas.total}/35`,    latest: `${latest.cas.total}/35` },
    { label: "Info./Orientación",       prev: `${prev.io.total}/12`,     latest: `${latest.io.total}/12` },
    { label: "Hab. Mental",             prev: `${prev.hm.total}/11`,     latest: `${latest.hm.total}/11` },
    { label: "Psicomotricidad",         prev: `${prev.pm.laberintoPts}/12`, latest: `${latest.pm.laberintoPts}/12` },
    { label: "Denom. Viso-Verbal",      prev: `${prev.lenguaje.visoVerbalLamina + prev.lenguaje.visoVerbalObjetos}/16`, latest: `${latest.lenguaje.visoVerbalLamina + latest.lenguaje.visoVerbalObjetos}/16` },
    { label: "Denom. Verbo-Verbal",     prev: `${prev.lenguaje.frutasTotal + prev.lenguaje.palabrasMTotal} pal.`, latest: `${latest.lenguaje.frutasTotal + latest.lenguaje.palabrasMTotal} pal.` },
    { label: "Repetición",              prev: `${prev.lenguaje.repeticionTotal}/4`, latest: `${latest.lenguaje.repeticionTotal}/4` },
    { label: "Comprensión",             prev: `${prev.lenguaje.comprensionTotal}/5`, latest: `${latest.lenguaje.comprensionTotal}/5` },
    { label: "Reloj",                   prev: `${prev.reloj.total}/10`,   latest: `${latest.reloj.total}/10` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* CAS summary */}
      <Card style={{ background: bgColor, border: `2px solid ${color}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color, fontFamily: fonts.heading, lineHeight: 1 }}>
              {latest.cas.total}
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>de 35</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: "inline-block", background: color, color: "white", borderRadius: 20, padding: "6px 16px", fontSize: 14, fontWeight: 700 }}>
              {latest.cas.clasificacion || "Sin clasificación"}
            </div>
            {casChange !== 0 && (
              <div style={{ fontSize: 14, color: casChange > 0 ? colors.sage : colors.terracotta, fontWeight: 600, marginTop: 8 }}>
                {casChange > 0 ? `+${casChange}` : casChange} puntos desde la evaluación anterior
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Line chart */}
      <Card>
        <SectionTitle icon="📈" title="Evolución CAS" subtitle="Puntaje total a lo largo del tiempo" />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: colors.muted }} />
            <YAxis domain={[0, 35]} tick={{ fontSize: 12, fill: colors.muted }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontFamily: fonts.body }} />
            <Line type="monotone" dataKey="cas" stroke={colors.terracotta} strokeWidth={3} dot={{ fill: colors.terracotta, r: 6 }} activeDot={{ r: 8 }} name="CAS Total" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 14, color: colors.dark, lineHeight: 1.6, marginTop: 12, background: colors.lightSage, borderRadius: 12, padding: "14px 18px" }}>
          <strong style={{ color: colors.sage }}>Lo que esto significa: </strong>
          Cada punto de avance refleja el esfuerzo de {patientFirstName}. La
          dirección de la línea es la que importa — y estamos trabajando para que siga subiendo.
        </div>
      </Card>

      {/* Radar comparison */}
      <Card>
        <SectionTitle icon="🕸️" title="Comparación por área" subtitle="Evaluación anterior vs. más reciente (% del máximo)" />
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarCompare} cx="50%" cy="50%">
            <PolarGrid stroke="#EDE8E3" />
            <PolarAngleAxis dataKey="area" tick={{ fontSize: 11, fill: colors.dark, fontFamily: fonts.body }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: colors.muted }} tickCount={3} />
            <Radar name={`Anterior (${formatDate(prev.fecha)})`} dataKey="anterior" stroke={colors.peach} fill={colors.peach} fillOpacity={0.3} strokeWidth={2} />
            <Radar name={`Actual (${formatDate(latest.fecha)})`} dataKey="actual" stroke={colors.sage} fill={colors.sage} fillOpacity={0.35} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: fonts.body }} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Comparison table */}
      <Card>
        <SectionTitle icon="🔄" title="Tabla comparativa" subtitle={`${formatDate(prev.fecha)} → ${formatDate(latest.fecha)}`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px 4px", color: colors.muted, fontWeight: 600, borderBottom: "1px solid #EDE8E3" }}>Sección</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: colors.muted, fontWeight: 600, borderBottom: "1px solid #EDE8E3" }}>{formatDate(prev.fecha)}</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: colors.sage, fontWeight: 700, borderBottom: "1px solid #EDE8E3" }}>{formatDate(latest.fecha)}</th>
                <th style={{ textAlign: "center", padding: "8px 4px", color: colors.muted, fontWeight: 600, borderBottom: "1px solid #EDE8E3" }}>Cambio</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => {
                const prevNum = parseFloat(row.prev);
                const latestNum = parseFloat(row.latest);
                const diff = latestNum - prevNum;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #F5F0EB" }}>
                    <td style={{ padding: "9px 4px", color: colors.dark, fontWeight: i === 0 ? 700 : 400 }}>{row.label}</td>
                    <td style={{ textAlign: "center", padding: "9px 4px", color: colors.muted }}>{row.prev}</td>
                    <td style={{ textAlign: "center", padding: "9px 4px", color: colors.dark, fontWeight: i === 0 ? 700 : 400 }}>{row.latest}</td>
                    <td style={{ textAlign: "center", padding: "9px 4px", fontWeight: 600, color: diff > 0 ? colors.sage : diff < 0 ? colors.terracotta : colors.muted }}>
                      {diff > 0 ? `+${diff}` : diff === 0 ? "—" : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reloj alert */}
      {latest.reloj.sospechaDeficit && (
        <Card style={{ background: "#FFF3E0", border: "2px solid #E8893A44" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#C67B2A", fontSize: 15, marginBottom: 6 }}>Nota sobre el dibujo del reloj</div>
              <p style={{ fontSize: 14, color: colors.dark, margin: 0, lineHeight: 1.6 }}>
                El resultado del dibujo del reloj en la evaluación más reciente ({latest.reloj.total}/10) sugiere
                posible déficit cognitivo. Esto será evaluado en detalle por la terapeuta.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
