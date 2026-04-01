// src/app/progreso/[token]/page.tsx
import { notFound } from "next/navigation";
import { getPatientByToken } from "@/lib/data";
import PatientDashboard from "@/components/PatientDashboard";

interface PageProps {
  params: { token: string };
}

export const revalidate = 60; // ISR: revalidar cada 60 segundos

export default async function ProgresoPage({ params }: PageProps) {
  const { token } = params;
  console.log("Token recibido:", token);

  // Validar formato del token (solo hex, 32 chars)
//   if (!/^[a-f0-9]{32}$/.test(token)) {
//     notFound();
//   }

  const data = await getPatientByToken(token);

  if (!data) {
    notFound();
  }

  return <PatientDashboard data={data} />;
}