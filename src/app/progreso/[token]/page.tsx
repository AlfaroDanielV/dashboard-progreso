// src/app/progreso/[token]/page.tsx
import { notFound } from "next/navigation";
import { getPatientByToken } from "@/lib/data";
import PatientDashboard from "@/components/PatientDashboard";
import type { DashboardData } from "@/lib/types";

interface PageProps {
  params: { token: string };
}

export const revalidate = 60; // ISR: revalidar cada 60 segundos

function buildPatientContext(data: DashboardData): string {
  const { patient, evaluations, tamizaje, sessions, victories, recommendations, domains, guides } = data;

  let context = `PACIENTE: ${patient.name}, ${patient.age} años\n`;
  context += `DIAGNÓSTICO: ${patient.diagnosis}\n`;
  context += `FECHA DE INGRESO: ${patient.startDate}\n`;
  context += `ESTADO: ${patient.status}\n`;
  context += `ÁREAS DE INTERVENCIÓN: ${patient.interventionAreas}\n\n`;

  if (domains.length > 0) {
    context += "DOMINIOS COGNITIVOS (ACE-III):\n";
    domains.forEach((d) => {
      context += `- ${d.domain}: Inicial ${d.initial}/${d.max}, Actual ${d.current}/${d.max} (${d.desc})\n`;
    });
    context += "\n";
  }

  if (evaluations.length > 0) {
    const latest = evaluations[evaluations.length - 1];
    context += `ÚLTIMA EVALUACIÓN ACE-III (${latest.date}): Total = ${latest.totalACE}/100\n`;
    context += `Atención: ${latest.atencion}/18, Memoria: ${latest.memoria}/26, Fluencia: ${latest.fluencia}/14, Lenguaje: ${latest.lenguaje}/26, Visuoespacial: ${latest.visuoespacial}/16\n\n`;
  }

  if (tamizaje && tamizaje.length > 0) {
    const latest = tamizaje[0]; // sorted by date desc
    context += `\nTAMIZAJE COGNITIVO (evaluacion mas reciente: ${latest.fecha}):\n`;
    context += `Informacion/Orientacion: ${latest.informacionOrientacion ?? "N/A"}\n`;
    context += `Habilidad Mental: ${latest.habilidadMental ?? "N/A"}\n`;
    context += `Psicomotricidad: ${latest.psicomotricidad ?? "N/A"}\n`;
    context += `Grado de deterioro cognitivo (CAS Total): ${latest.gradoDeterioroCognitivo ?? "N/A"}/35\n`;

    const cas = latest.gradoDeterioroCognitivo;
    if (cas !== null && cas !== undefined) {
      let clasificacion = "";
      if (cas >= 30) clasificacion = "A — Ausencia de deterioro";
      else if (cas >= 24) clasificacion = "B — Deterioro leve";
      else if (cas >= 16) clasificacion = "C — Deterioro moderado";
      else if (cas >= 9) clasificacion = "D — Deterioro acusado";
      else clasificacion = "E — Deterioro grave";
      context += `Clasificacion: ${clasificacion}\n`;
    }

    context += `Denominacion: ${latest.denominacion ?? "N/A"}\n`;
    context += `Repeticion: ${latest.repeticion ?? "N/A"}\n`;
    context += `Comprension: ${latest.comprension ?? "N/A"}\n`;
    context += `Dibujo del reloj: ${latest.dibujoReloj ?? "N/A"}\n`;
    if (latest.observaciones) {
      context += `Observaciones: ${latest.observaciones}\n`;
    }
    context += "\n";
  }

  if (sessions.length > 0) {
    context += `SESIONES COMPLETADAS: ${sessions.length}\n`;
    const recent = sessions.slice(-3);
    context += "SESIONES RECIENTES:\n";
    recent.forEach((s) => {
      context += `- Sesión ${s.sessionNumber} (${s.date}): ${s.area}. ${s.observations}\n`;
    });
    context += "\n";
  }

  if (victories.length > 0) {
    context += "VICTORIAS RECIENTES:\n";
    victories.slice(-5).forEach((v) => {
      context += `- ${v.date}: ${v.text} (${v.area})\n`;
    });
    context += "\n";
  }

  if (recommendations.length > 0) {
    context += "RECOMENDACIONES PARA CASA:\n";
    recommendations.forEach((r) => {
      context += `- ${r.area}: ${r.activity} (${r.frequency}). ${r.notes}\n`;
    });
    context += "\n";
  }

  if (guides && guides.length > 0) {
    context += "GUÍAS DISPONIBLES:\n";
    guides.forEach((g) => {
      context += `- ${g.titulo}: ${g.descripcion}\n`;
    });
  }

  return context;
}

export default async function ProgresoPage({ params }: PageProps) {
  const { token } = params;
  console.log("Token recibido:", token);

  const data = await getPatientByToken(token);

  if (!data) {
    notFound();
  }

  return (
    <PatientDashboard
      data={data}
      patientContext={buildPatientContext(data)}
    />
  );
}
