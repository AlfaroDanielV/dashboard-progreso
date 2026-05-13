// src/components/PatientDashboard.tsx
"use client";
import { useState } from "react";
import { colors, fonts, WHATSAPP_URL } from "@/config/brand";
import ResumenTab from "@/components/tabs/ResumenTab";
import DominiosTab from "@/components/tabs/DominiosTab";
import SesionesTab from "@/components/tabs/SesionesTab";
import VictoriasTab from "@/components/tabs/VictoriasTab";
import HogarTab from "@/components/tabs/HogarTab";
import GuiasTab from "@/components/tabs/GuiasTab";
import TamizajeTab from "@/components/tabs/TamizajeTab";
import ChatBot from "@/components/ChatBot";
import type { DashboardData } from "@/lib/types";

interface Props {
  data: DashboardData;
  patientContext: string;
}

const TAB_TOOLTIPS: Record<string, { title: string; paragraphs: string[] }> = {
  resumen: {
    title: '✨ Resumen — "¿Cómo va en general?"',
    paragraphs: [
      "Esta es la primera pantalla que ven al abrir el portal. Les da un panorama completo en segundos.",
      "La gráfica en forma de estrella (radar) muestra 5 áreas que evaluamos: Atención, Memoria, Fluencia (encontrar palabras), Lenguaje (comprender y expresarse), y Habilidades Visuoespaciales (procesar lo que ve). Cada área tiene una puntuación. Van a ver dos figuras superpuestas: la más clara es cómo estaba al inicio, y la más intensa es cómo está ahora. Mientras más se expande la figura verde, más progreso hay. Piensen en ella como un \"mapa\" de las capacidades de su familiar — y lo que buscamos es que ese mapa crezca.",
      "La línea que sube muestra la puntuación general a lo largo del tiempo. Cada punto es una evaluación formal que realizamos. Mientras la línea suba, hay avance. Es la forma más directa de ver \"la dirección\" del proceso.",
      "La tarjeta verde destacada muestra el logro más reciente — algo concreto que su familiar logró y que demuestra progreso real. No es solo un número: es un momento de vida recuperada.",
      "Los 4 recuadros les dicen: cuántas sesiones llevan del total, la puntuación actual, cuántos puntos ha mejorado desde el inicio, y cuándo es la próxima cita.",
    ],
  },
  tamizaje: {
    title: '🧠 Tamizaje Cognitivo — "¿Cuál es el perfil cognitivo?"',
    paragraphs: [
      "Esta sección muestra los resultados del Tamizaje Cognitivo, una evaluación estandarizada que mide múltiples áreas cognitivas.",
      "El puntaje del tamizaje cognitivo (de 0 a 35) resume el desempeño global. La clasificación indica el nivel de desempeño: desde A (sin deterioro) hasta E (deterioro muy severo).",
      "La gráfica de radar muestra las 6 grandes áreas evaluadas como porcentaje de su máximo. Cuanto más se expande la figura, mejor el desempeño.",
      "Las barras horizontales muestran el puntaje obtenido en cada subárea específica, para identificar fortalezas y áreas a trabajar.",
    ],
  },
  dominios: {
    title: '🧠 Dominios — "¿En qué áreas está mejorando?"',
    paragraphs: [
      "Aquí pueden ver cada una de las 5 áreas que trabajamos, explicadas en lenguaje claro:",
      "Atención es la capacidad de concentrarse, saber en qué día estamos, en qué lugar estamos, y poder mantener el foco en lo que se está haciendo.",
      "Memoria es la habilidad de recordar cosas nuevas (como un nombre que acaban de decirle) y recuperar recuerdos que ya tiene (como una dirección conocida).",
      "Fluencia es la facilidad para encontrar palabras. Cuando alguien \"tiene la palabra en la punta de la lengua\" pero no la encuentra, esa es el área de fluencia.",
      "Lenguaje es más amplio: incluye entender lo que lee, nombrar objetos al verlos, seguir instrucciones, y expresar ideas con claridad.",
      "Visuoespacial es la capacidad de procesar lo que ve — copiar un dibujo, entender un mapa, percibir distancias y formas.",
      "Cada área tiene una barra que muestra dónde empezó y dónde está ahora, junto con un indicador de cuántos puntos ha ganado. La gráfica de barras al final les permite comparar todas las áreas lado a lado.",
    ],
  },
  sesiones: {
    title: '📝 Sesiones — "¿Qué hicieron hoy?"',
    paragraphs: [
      "Cada vez que su familiar tiene una sesión, aparece aquí un resumen de lo que trabajamos. Pueden ver la fecha, el área que se trabajó, y una descripción de lo que hicimos y cómo respondió.",
      "Algunas sesiones tienen un borde dorado — eso significa que hubo un momento especial, un avance o un logro que queremos destacar.",
      "Esta sección existe para que nunca se pregunten \"¿y qué pasó en la sesión?\" La respuesta siempre está aquí, disponible cuando quieran.",
    ],
  },
  victorias: {
    title: '🏆 Victorias — "¿Qué ha logrado?"',
    paragraphs: [
      "Esta es nuestra sección favorita. Aquí documentamos los logros concretos de su familiar: la primera vez que pidió algo en un restaurante sin ayuda, el día que mantuvo una conversación larga sin perder el hilo, la mañana que recordó el nombre de su nieta sin que nadie se lo recordara.",
      "Cada victoria tiene una fecha, un área asociada, y una descripción de cómo se evidenció. Las victorias con borde dorado son de alto impacto — momentos que marcan un antes y un después.",
      "Sabemos que el camino no siempre es fácil. Hay días difíciles. Por eso esta sección existe: para recordarnos a todos — a ustedes, a su familiar, y a nosotros — que el progreso es real, que cada paso cuenta, y que cada logro merece ser celebrado.",
    ],
  },
  hogar: {
    title: '🏠 En casa — "¿Qué podemos hacer nosotros?"',
    paragraphs: [
      "La terapia no termina cuando termina la sesión. En esta sección encontrarán actividades sencillas y concretas que pueden hacer en casa con su familiar. No son \"tareas\" ni ejercicios complicados — son oportunidades para compartir momentos juntos mientras fortalecen las habilidades que estamos trabajando.",
      "Cada actividad indica el área que trabaja y con qué frecuencia recomendamos hacerla. Son actividades que se integran naturalmente en la rutina: conversaciones durante la cena, juegos de mesa, lecturas compartidas.",
      "Y si en algún momento tienen una duda, quieren compartir un avance, o simplemente necesitan orientación, el botón de WhatsApp al final los conecta directamente con nosotros. Nos encanta saber cómo va su familiar entre sesiones — cada avance, por pequeño que parezca, es importante.",
    ],
  },
  guias: {
    title: '📚 Guías — "¿Cómo entender mejor el proceso?"',
    paragraphs: [
      "En esta sección encontrarán materiales educativos y recursos que les ayudarán a comprender mejor el diagnóstico, la terapia y cómo acompañar a su familiar en el día a día.",
      "Las guías están pensadas para la familia: sin tecnicismos, con ejemplos prácticos, y con el objetivo de que se sientan más seguros y preparados para este camino.",
    ],
  },
};

// Assessment labels
const ASSESSMENT_LABELS: Record<string, string> = {
  ACE_III: "Evolución",
  Tamizaje_Cognitivo: "Tamizaje Cognitivo",
};

// Normalize so "ACE-III", "ACE III", "ace_iii" all resolve the same way
function normAssessment(s: string): string {
  const low = s.toLowerCase().replace(/[-_\s]/g, "");
  if (low.includes("ace")) return "ACE_III";
  if (low.includes("tamizaje")) return "Tamizaje_Cognitivo";
  return s;
}

export default function PatientDashboard({ data, patientContext }: Props) {
  const { patient, evaluations, sessions, victories, recommendations, domains, guides = [], tamizaje = [] } = data;
  const firstName = patient.name.split(" ")[0];
  const { familyInfo } = data;

  // Normalize pruebas in case any value came through with alternate separators
  const pruebas = (patient.pruebas ?? ["ACE_III"]).map(normAssessment);
  const hasMultipleAssessments = pruebas.length > 1;
  const preferredAssessment =
    pruebas.includes("Tamizaje_Cognitivo")
      ? "Tamizaje_Cognitivo"
      : pruebas[0] || "ACE_III";

  const [selectedAssessment, setSelectedAssessment] = useState<string>(
    preferredAssessment
  );

  // Use normalized comparison — robust against "ACE-III" vs "ACE_III" etc.
  const isACE = normAssessment(selectedAssessment) === "ACE_III";
  const isTamizaje = normAssessment(selectedAssessment) === "Tamizaje_Cognitivo";

  // Build sub-tab list:
  //   ACE-III selected  → Resumen + Habilidades first, then shared tabs
  //   Tamizaje selected → Evaluación first, then shared tabs
  //   Unknown           → fall back to ACE tabs when evaluations exist
  const showACETabs = isACE || (!isTamizaje && evaluations.length > 0);
  const subTabs = [
    ...(showACETabs ? [
      { id: "resumen",  label: "Resumen",     icon: "✨" },
      { id: "dominios", label: "Habilidades",  icon: "🧠" },
    ] : []),
    ...(isTamizaje ? [
      { id: "tamizaje", label: "Evaluación", icon: "🧩" },
    ] : []),
    { id: "sesiones",  label: "Sesiones",  icon: "📝" },
    { id: "victorias", label: "Victorias", icon: "🏆" },
    { id: "hogar",     label: "En casa",   icon: "🏠" },
    { id: "guias",     label: "Guías",     icon: "📚" },
  ];

  const defaultTab = isTamizaje
    ? "tamizaje"
    : showACETabs
      ? "resumen"
      : "sesiones";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showTooltip, setShowTooltip] = useState(false);

  // When switching assessments, jump to the first meaningful tab
  function handleSelectAssessment(prueba: string) {
    const norm = normAssessment(prueba);
    setSelectedAssessment(norm);
    setShowTooltip(false);
    if (norm === "ACE_III") setActiveTab("resumen");
    else if (norm === "Tamizaje_Cognitivo") setActiveTab("tamizaje");
    else setActiveTab("sesiones");
  }

  const totalChange =
    evaluations.length >= 2
      ? evaluations[evaluations.length - 1].totalACE - evaluations[0].totalACE
      : 0;

  const latestACE = evaluations.length > 0
    ? evaluations[evaluations.length - 1]
    : null;

  const currentScore =
    latestACE
      ? latestACE.totalACE
      : 0;

  const sessionPct = familyInfo.totalSessionsPlan > 0
    ? Math.round((familyInfo.sessionsCompleted / familyInfo.totalSessionsPlan) * 100)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${colors.cream} 0%, #F5F0EB 100%)`,
        fontFamily: fonts.body,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.terracotta} 0%, ${colors.terracotta}ee 60%, ${colors.sage} 100%)`,
          padding: "32px 24px 28px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: 0.8,
              marginBottom: 4,
            }}
          >
            Terapia del Lenguaje
          </div>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 26,
              fontWeight: 700,
              margin: "0 0 4px",
            }}
          >
            El camino de {firstName}
          </h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>
            {patient.diagnosis}
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "10px 16px",
                flex: "1 1 140px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.75,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Sesiones
              </div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {familyInfo.sessionsCompleted}/{familyInfo.totalSessionsPlan}
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.2)",
                  marginTop: 6,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    background: "white",
                    width: `${Math.min(sessionPct, 100)}%`,
                  }}
                />
              </div>
            </div>

            {evaluations.length > 0 && isACE && (
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: "10px 16px",
                  flex: "1 1 140px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.75,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Puntaje ACE-III
                </div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>
                  {currentScore}/100
                </div>
                {evaluations.length > 1 && (
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
                    +{totalChange} puntos desde el inicio
                  </div>
                )}
              </div>
            )}

            {tamizaje.length > 0 && isTamizaje && (() => {
              const latestTam = tamizaje[0]; // sorted desc
              const cas = latestTam.gradoDeterioroCognitivo;
              let casLabel = "";
              if (cas !== null) {
                if (cas >= 30) casLabel = "Ausencia de deterioro";
                else if (cas >= 24) casLabel = "Deterioro leve";
                else if (cas >= 16) casLabel = "Deterioro moderado";
                else if (cas >= 9) casLabel = "Deterioro acusado";
                else casLabel = "Deterioro grave";
              }
              return (
                <div
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    padding: "10px 16px",
                    flex: "1 1 140px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Tamizaje Cognitivo
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    {cas ?? "—"}/35
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {casLabel}
                  </div>
                </div>
              );
            })()}

            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "10px 16px",
                flex: "1 1 140px",
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>
                Próxima cita
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                {familyInfo.nextSession || "Por confirmar"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: colors.cream,
          borderBottom: "1px solid #EDE8E3",
        }}
      >
        {/* Assessment selector — only show when patient has multiple assessments */}
        {hasMultipleAssessments && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
              padding: "12px 16px 0",
            }}
          >
            {[...pruebas].sort((a, b) => {
              if (a === "Tamizaje_Cognitivo" && b !== "Tamizaje_Cognitivo") return -1;
              if (b === "Tamizaje_Cognitivo" && a !== "Tamizaje_Cognitivo") return 1;
              return 0;
            }).map((prueba) => {
              const isActive = normAssessment(selectedAssessment) === prueba;
              return (
                <button
                  key={prueba}
                  onClick={() => handleSelectAssessment(prueba)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    fontFamily: fonts.body,
                    cursor: "pointer",
                    border: `2px solid ${isActive ? colors.terracotta : colors.terracotta + "4D"}`,
                    background: isActive ? colors.terracotta : "transparent",
                    color: isActive ? "white" : colors.terracotta,
                    transition: "all 0.2s ease",
                    minWidth: 0,
                    flex: "0 1 auto",
                  }}
                >
                  {ASSESSMENT_LABELS[prueba] || prueba.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            justifyContent: "center",
            padding: hasMultipleAssessments ? "8px 16px" : "12px 16px",
          }}
        >
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setShowTooltip(false); }}
              style={{
                padding: "6px 14px",
                borderRadius: 16,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                fontFamily: fonts.body,
                background: activeTab === tab.id ? colors.terracotta : "transparent",
                color: activeTab === tab.id ? "white" : colors.muted,
                transition: "all 0.2s ease",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tooltip Modal */}
      {showTooltip && TAB_TOOLTIPS[activeTab] && (
        <div
          onClick={() => setShowTooltip(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.warmWhite,
              borderRadius: "20px 20px 0 0",
              padding: "28px 24px 40px",
              maxWidth: 600,
              width: "100%",
              maxHeight: "75vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: "#D9D0C9" }} />
            </div>
            <h2
              style={{
                fontFamily: fonts.heading,
                fontSize: 18,
                color: colors.dark,
                margin: "0 0 16px",
                lineHeight: 1.4,
              }}
            >
              {TAB_TOOLTIPS[activeTab].title}
            </h2>
            {TAB_TOOLTIPS[activeTab].paragraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  fontSize: 14,
                  color: colors.dark,
                  lineHeight: 1.7,
                  margin: "0 0 12px",
                  opacity: 0.85,
                }}
              >
                {p}
              </p>
            ))}
            <button
              onClick={() => setShowTooltip(false)}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                border: "none",
                background: colors.terracotta,
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: fonts.body,
                cursor: "pointer",
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "20px 16px 40px",
        }}
      >
        {/* Info button */}
        {TAB_TOOLTIPS[activeTab] && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={() => setShowTooltip(true)}
              title="¿Qué muestra esta sección?"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 12px",
                borderRadius: 20,
                border: `1.5px solid ${colors.peach}`,
                background: "white",
                color: colors.terracotta,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: fonts.body,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14 }}>ℹ</span> ¿Qué es esto?
            </button>
          </div>
        )}

        {activeTab === "resumen" && (
          <ResumenTab
            evaluations={evaluations}
            domains={domains}
            victories={victories}
          />
        )}
        {activeTab === "dominios" && (
          <DominiosTab
            domains={domains}
            patientFirstName={firstName}
          />
        )}
        {activeTab === "tamizaje" && (
          <TamizajeTab
            tamizaje={tamizaje}
            patientFirstName={firstName}
            latestACE={latestACE}
          />
        )}
        {activeTab === "sesiones" && (
          <SesionesTab
            sessions={sessions}
            patientFirstName={firstName}
          />
        )}
        {activeTab === "victorias" && (
          <VictoriasTab
            victories={victories}
            patientFirstName={firstName}
          />
        )}
        {activeTab === "hogar" && (
          <HogarTab
            recommendations={recommendations}
            patientFirstName={firstName}
            whatsappUrl={WHATSAPP_URL}
          />
        )}
        {activeTab === "guias" && (
          <GuiasTab guides={guides} />
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px 0",
            fontSize: 12,
            color: colors.muted,
            lineHeight: 1.6,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: colors.terracotta,
              marginBottom: 4,
            }}
          >
            Terapia del Lenguaje
          </div>
          Lic. Julisa Mendoza · Los Yoses, San José
          <br />
          terapiadelenguaje.cr
        </div>
      </div>

      <ChatBot patientContext={patientContext} patientName={patient.name} pruebas={pruebas} />
    </div>
  );
}
