// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progreso del Paciente | Terapia del Lenguaje",
  description:
    "Portal de seguimiento del progreso terapéutico. Terapia del Lenguaje — Lic. Julisa Mendoza, Los Yoses, San José, Costa Rica.",
  robots: "noindex, nofollow", // No indexar — es privado
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}