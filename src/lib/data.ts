// src/lib/data.ts
import { getMultipleSheets, getSheetData, buildDriveFileMap } from "./sheets";
import type {
  Patient,
  FamilyInfo,
  ACEEvaluation,
  TamizajeEvaluation,
  Session,
  Victory,
  Recommendation,
  DomainProgress,
  DashboardData,
  Guide,
} from "./types";

// ─── Helpers ───

function parseNumber(val: string | undefined): number {
  if (!val) return 0;
  const n = Number(val.replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// Handles MM/DD/YYYY and DD/MM/YYYY (detects by checking which part would be an invalid month)
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const a = parseInt(parts[0]);
    const b = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    // If first part > 12, it must be DD/MM/YYYY
    // If second part > 12, it must be MM/DD/YYYY
    // Otherwise assume DD/MM/YYYY (Spanish default)
    if (a > 12) return new Date(year, b - 1, a);   // DD/MM/YYYY
    if (b > 12) return new Date(year, a - 1, b);   // MM/DD/YYYY
    return new Date(year, b - 1, a);               // ambiguous → DD/MM/YYYY
  }
  return new Date(dateStr);
}

function rowToObject(headers: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((h, i) => {
    // Strip trailing " (/N)" suffix that AppSheet/Sheets adds to score columns
    const key = h.trim().replace(/\s*\(\/\d+\)\s*$/, "");
    obj[key] = (row[i] || "").trim();
  });
  return obj;
}

// ─── Configuración por hoja ───
// headerRow: en qué fila (0-indexed) están los headers
// dataStart: en qué fila (0-indexed) empiezan los datos

const SHEET_CONFIG: Record<string, { headerRow: number; dataStart: number }> = {
  Registro:           { headerRow: 2, dataStart: 3 },  // Filas 1-2 decorativas, headers en fila 3
  ACE_III:            { headerRow: 1, dataStart: 2 },   // Fila 0 decorativa, headers en fila 1
  Sesiones:           { headerRow: 2, dataStart: 3 },
  Victorias:          { headerRow: 0, dataStart: 1 },
  Recomendaciones:    { headerRow: 0, dataStart: 1 },
  Info_Familia:       { headerRow: 0, dataStart: 1 },
  Guias:              { headerRow: 0, dataStart: 1 },
  Tamizaje_Cognitivo: { headerRow: 0, dataStart: 1 },  // Standard: headers row 1, data row 2+
};

// ─── Normalize assessment names ───
// Maps any variation of ACE / Tamizaje to the canonical key used in code.
function normalizePrueba(p: string): string {
  const low = p.toLowerCase().replace(/[-_\s]/g, "");
  if (low.includes("ace")) return "ACE_III";
  if (low.includes("tamizaje")) return "Tamizaje_Cognitivo";
  return p; // unknown assessment — keep as-is
}

// ─── Parsers ───

function parsePatient(headers: string[], row: string[]): Patient {
  const r = rowToObject(headers, row);

  // Parse pruebas: comma-separated list, default to ACE_III if empty/missing
  // Normalize each value to canonical form so "ACE-III", "ACE III", "ace_iii" all → "ACE_III"
  const pruebasRaw = (r["Pruebas"] || "").trim();
  const pruebas = pruebasRaw
    ? pruebasRaw.split(",").map((p) => normalizePrueba(p.trim())).filter(Boolean)
    : ["ACE_III"];
  console.log("[Registro] Pruebas raw:", JSON.stringify(pruebasRaw), "→ normalized:", pruebas);

  return {
    id: r["ID Paciente"] || "",
    name: r["Nombre completo"] || "",
    birthDate: r["Fecha de nacimiento"] || "",
    age: parseNumber(r["Edad"]),
    gender: r["Género"] || r["Genero"] || "",
    education: parseNumber(r["Escolaridad (años)"] || r["Escolaridad"]),
    occupation: r["Profesión/Ocupación"] || r["Profesion/Ocupacion"] || "",
    diagnosis: r["Diagnóstico médico"] || r["Diagnostico medico"] || "",
    referringDoctor: r["Médico referente"] || r["Medico referente"] || "",
    startDate: r["Fecha de ingreso"] || "",
    status: r["Estado"] || "",
    interventionAreas: r["Áreas de intervención"] || r["Areas de intervencion"] || "",
    modality: r["Modalidad"] || "",
    familyContact: r["Familiar/Cuidador"] || "",
    token: "", // Token vive en Info_Familia
    pruebas,
  };
}

function parseFamilyInfo(headers: string[], row: string[]): FamilyInfo {
  const r = rowToObject(headers, row);
  return {
    id: r["ID familia"] || r["ID Familia"] || "",
    patientId: r["ID Paciente"] || "",
    personalMessage: r["Mensaje personalizado"] || "",
    nextSession: r["Proxima cita"] || r["Próxima cita"] || "",
    totalSessionsPlan: parseNumber(r["Total sesiones plan"]),
    sessionsCompleted: parseNumber(r["Sesiones completadas"]),
    familyNotes: r["Notas para la familia"] || "",
    token: r["token_acceso"] || "",
  };
}

function parseACEEvaluation(headers: string[], row: string[]): ACEEvaluation {
  const r = rowToObject(headers, row);

  const orientacionTemporal = parseNumber(r["Orientación temporal"] || r["Orientacion temporal"]);
  const orientacionEspacial = parseNumber(r["Orientación espacial"] || r["Orientacion espacial"]);
  const registro3Palabras = parseNumber(r["Registro 3 palabras"]);
  const sustraccionSerial = parseNumber(r["Sustracción serial"] || r["Sustraccion serial"]);

  const recuerdo3Palabras = parseNumber(r["Recuerdo 3 palabras"]);
  const nombreDireccionAprendizaje = parseNumber(r["Nombre-dirección aprendizaje"] || r["Nombre-direccion aprendizaje"]);
  const personajesFamosos = parseNumber(r["Personajes famosos"]);
  const recuerdoNombreDireccion = parseNumber(r["Recuerdo nombre-dirección"] || r["Recuerdo nombre-direccion"]);
  const reconocimiento = parseNumber(r["Reconocimiento"]);

  const formalLetraP = parseNumber(r["Formal - Letra P"]);
  const categorialAnimales = parseNumber(r["Categorial - Animales"]);

  const comprensionOrdenes = parseNumber(r["Comprensión órdenes"] || r["Comprension ordenes"]);
  const escritura = parseNumber(r["Escritura"]);
  const repeticionPalabras = parseNumber(r["Repetición palabras"] || r["Repeticion palabras"]);
  const repeticionFrases = parseNumber(r["Repetición frases"] || r["Repeticion frases"]);
  const denominacion = parseNumber(r["Denominación"] || r["Denominacion"]);
  const lectura = parseNumber(r["Lectura"]);

  const conteoPuntos = parseNumber(r["Conteo puntos"]);
  const identificarLetras = parseNumber(r["Identificar letras"]);
  const copiarDiagrama = parseNumber(r["Copiar diagrama"]);
  const copiarDibujo = parseNumber(r["Copiar dibujo"]);
  const reloj = parseNumber(r["Reloj"]);

  const atencion = orientacionTemporal + orientacionEspacial + registro3Palabras + sustraccionSerial;
  const memoria = recuerdo3Palabras + nombreDireccionAprendizaje + personajesFamosos + recuerdoNombreDireccion + reconocimiento;
  const fluencia = formalLetraP + categorialAnimales;
  const lenguaje = comprensionOrdenes + escritura + repeticionPalabras + repeticionFrases + denominacion + lectura;
  const visuoespacial = conteoPuntos + identificarLetras + copiarDiagrama + copiarDibujo + reloj;
  const totalACE = atencion + memoria + fluencia + lenguaje + visuoespacial;

  return {
    patientId: r["ID Paciente"] || "",
    date: r["Fecha evaluación"] || r["Fecha evaluacion"] || "",
    type: r["Tipo"] || "",
    orientacionTemporal, orientacionEspacial, registro3Palabras, sustraccionSerial,
    recuerdo3Palabras, nombreDireccionAprendizaje, personajesFamosos, recuerdoNombreDireccion, reconocimiento,
    formalLetraP, categorialAnimales,
    comprensionOrdenes, escritura, repeticionPalabras, repeticionFrases, denominacion, lectura,
    conteoPuntos, identificarLetras, copiarDiagrama, copiarDibujo, reloj,
    totalACE, atencion, memoria, fluencia, lenguaje, visuoespacial,
  };
}

function parseTamizaje(headers: string[], row: string[]): TamizajeEvaluation {
  const r = rowToObject(headers, row);

  const sospechaRaw = (r["Reloj_Sospecha_Deficit"] || "").toLowerCase();
  const sospechaDeficit = sospechaRaw === "si" || sospechaRaw === "sí" || sospechaRaw === "true" || sospechaRaw === "1";

  return {
    evalId: r["EvalID"] || "",
    fecha: r["Fecha"] || "",
    examinador: r["Examinador"] || "",
    io: {
      nombre: parseNumber(r["IO_Nombre"]),
      edad: parseNumber(r["IO_Edad"]),
      fechaNacimiento: parseNumber(r["IO_Fecha_Nacimiento"]),
      pais: parseNumber(r["IO_Pais"]),
      provincia: parseNumber(r["IO_Provincia"]),
      lugar: parseNumber(r["IO_Lugar"]),
      presidenteAnterior: parseNumber(r["IO_Presidente_Anterior"]),
      presidenteActual: parseNumber(r["IO_Presidente_Actual"]),
      coloresBandera: parseNumber(r["IO_Colores_Bandera"]),
      dia: parseNumber(r["IO_Dia"]),
      mes: parseNumber(r["IO_Mes"]),
      ano: parseNumber(r["IO_Ano"]),
      total: parseNumber(r["IO_Total"]),
    },
    hm: {
      contarPts: parseNumber(r["HM_Contar_Pts"]),
      alfabetoPts: parseNumber(r["HM_Alfabeto_Pts"]),
      escribirNombrePts: parseNumber(r["HM_Escribir_Nombre_Pts"]),
      leerPts: parseNumber(r["HM_Leer_Pts"]),
      total: parseNumber(r["HM_Total"]),
    },
    pm: {
      laberintoPts: parseNumber(r["PM_Laberinto_Pts"]),
    },
    cas: {
      total: parseNumber(r["CAS_Total"]),
      clasificacion: r["CAS_Clasificacion"] || "",
    },
    lenguaje: {
      visoVerbalLamina: parseNumber(r["LVV_Total_Lamina"]),
      visoVerbalObjetos: parseNumber(r["LVV_Total_Objetos"]),
      frutasTotal: parseNumber(r["LDV_Frutas_Total"]),
      palabrasMTotal: parseNumber(r["LDV_Palabras_M_Total"]),
      repeticionTotal: parseNumber(r["LR_Total"]),
      comprensionTotal: parseNumber(r["LC_Total"]),
    },
    reloj: {
      esfera: parseNumber(r["Reloj_Esfera"]),
      numeros: parseNumber(r["Reloj_Numeros"]),
      manecillas: parseNumber(r["Reloj_Manecillas"]),
      total: parseNumber(r["Reloj_Total"]),
      sospechaDeficit,
    },
  };
}

function parseSession(headers: string[], row: string[]): Session {
  const r = rowToObject(headers, row);
  return {
    id: r["ID sesion"] || r["ID Sesion"] || "",
    patientId: r["ID Paciente"] || "",
    date: r["Fecha"] || "",
    sessionNumber: parseNumber(r["Nº Sesión"] || r["No Sesion"] || r["Nº Sesion"]),
    area: r["Área trabajada"] || r["Area trabajada"] || "",
    objectives: r["Objetivos de la sesión"] || r["Objetivos de la sesion"] || "",
    activities: r["Actividades realizadas"] || "",
    observations: r["Observaciones / Victorias"] || r["Observaciones"] || "",
    nextPlan: r["Plan para próxima sesión"] || r["Plan para proxima sesion"] || "",
    duration: parseNumber(r["Duración (min)"] || r["Duracion (min)"]),
  };
}

function parseVictory(headers: string[], row: string[]): Victory {
  const r = rowToObject(headers, row);
  return {
    id: r["ID victoria"] || r["ID Victoria"] || "",
    date: r["Fecha"] || "",
    text: r["Victoria / Logro"] || r["Victoria/Logro"] || "",
    area: r["Area"] || r["Área"] || "",
    evidence: r["Como se evidencio"] || r["¿Cómo se evidenció?"] || "",
  };
}

function parseRecommendation(headers: string[], row: string[]): Recommendation {
  const r = rowToObject(headers, row);
  return {
    id: r["ID recomendacion"] || r["ID Recomendacion"] || "",
    area: r["Area"] || r["Área"] || "",
    activity: r["Actividad recomendada"] || "",
    frequency: r["Frecuencia"] || "",
    notes: r["Observaciones"] || "",
  };
}

function parseGuide(
  headers: string[],
  row: string[],
  patientId: string,
  driveMap: Record<string, string>
): Guide | null {
  const r = rowToObject(headers, row);
  if ((r["ID Paciente"] || "").trim() !== patientId) return null;
  if ((r["Visible"] || "").trim().toLowerCase() !== "si") return null;

  const archivo = (r["Archivo"] || "").trim();
  // If Archivo is already a full URL, use it directly
  const archivoUrl = archivo.startsWith("http")
    ? archivo
    : driveMap[archivo.split("/").pop() || ""] || "";

  return {
    id: r["ID Guia"] || "",
    titulo: r["Titulo"] || "",
    descripcion: r["Descripcion"] || r["Descripción"] || "",
    archivoUrl,
    fecha: r["Fecha"] || "",
  };
}

// ─── Calcular progreso por dominio ───

function calculateDomains(evaluations: ACEEvaluation[]): DomainProgress[] {
  if (evaluations.length === 0) return [];

  const initial = evaluations[0];
  const current = evaluations[evaluations.length - 1];

  return [
    { domain: "Atención", max: 18, initial: initial.atencion, current: current.atencion, icon: "🎯", desc: "Concentración, orientación en tiempo y espacio" },
    { domain: "Memoria", max: 26, initial: initial.memoria, current: current.memoria, icon: "💭", desc: "Recordar nombres, direcciones, eventos recientes" },
    { domain: "Fluencia", max: 14, initial: initial.fluencia, current: current.fluencia, icon: "🗣️", desc: "Encontrar palabras, generar ideas con facilidad" },
    { domain: "Lenguaje", max: 26, initial: initial.lenguaje, current: current.lenguaje, icon: "📖", desc: "Comprensión, lectura, escritura, expresión" },
    { domain: "Visuoespacial", max: 16, initial: initial.visuoespacial, current: current.visuoespacial, icon: "👁️", desc: "Reconocer formas, copiar figuras, orientación visual" },
  ];
}

// ─── Helpers para obtener headers y datos según config ───

function getHeaders(rows: string[][], sheetName: string): string[] {
  const config = SHEET_CONFIG[sheetName] || { headerRow: 0 };
  return rows?.[config.headerRow] || [];
}

function getDataRows(rows: string[][], sheetName: string): string[][] {
  const config = SHEET_CONFIG[sheetName] || { dataStart: 1 };
  return (rows || []).slice(config.dataStart);
}

// ─── Función principal: buscar paciente por token ───

export async function getPatientByToken(
  token: string
): Promise<DashboardData | null> {
  try {
    console.log("=== getPatientByToken START, token:", token);

    const allData = await getMultipleSheets([
      "Registro",
      "ACE_III",
      "Sesiones",
      "Victorias",
      "Recomendaciones",
      "Info_Familia",
      "Guias",
    ]);

    console.log("=== Sheets fetched. Row counts:", {
      Registro: allData["Registro"]?.length,
      ACE_III: allData["ACE_III"]?.length,
      Sesiones: allData["Sesiones"]?.length,
      Info_Familia: allData["Info_Familia"]?.length,
    });

    // ─── 1. Buscar paciente por token en Info_Familia ───
    const infoRows = allData["Info_Familia"];
    console.log("Info_Familia headers:", infoRows?.[0]);
    console.log("Info_Familia fila 1 datos:", infoRows?.[1]);
    const infoHeaders = getHeaders(infoRows, "Info_Familia");
    const infoDataRows = getDataRows(infoRows, "Info_Familia");

    const tokenColIndex = infoHeaders.findIndex(
      (h) => h.trim() === "token_acceso"
    );

    if (tokenColIndex === -1) {
      console.error("Columna 'token_acceso' no encontrada en Info_Familia");
      return null;
    }

    const familyInfoRow = infoDataRows.find(
      (row) => (row[tokenColIndex] || "").trim() === token
    );

    if (!familyInfoRow) return null;

    const familyInfo = parseFamilyInfo(infoHeaders, familyInfoRow);
    const patientId = familyInfo.patientId;

    // ─── 2. Obtener datos del paciente de Registro ───
    const regRows = allData["Registro"];
    const regHeaders = getHeaders(regRows, "Registro");
    const regDataRows = getDataRows(regRows, "Registro");

    const regIdColIndex = regHeaders.findIndex(
      (h) => h.trim() === "ID Paciente"
    );

    const patientRow = regDataRows.find(
      (row) => (row[regIdColIndex] || "").trim() === patientId
    );

    if (!patientRow) return null;

    const patient = parsePatient(regHeaders, patientRow);
    console.log("[Patient] ID:", patient.id, "| pruebas:", patient.pruebas);

    // ─── 3. Evaluaciones ACE-III ───
    const aceRows = allData["ACE_III"];
    const aceHeaders = getHeaders(aceRows, "ACE_III");
    const aceDataRows = getDataRows(aceRows, "ACE_III");
    const aceIdCol = aceHeaders.findIndex((h) => h.trim() === "ID Paciente");

    const evaluations: ACEEvaluation[] = aceDataRows
      .filter((row) => (row[aceIdCol] || "").trim() === patientId)
      .map((row) => parseACEEvaluation(aceHeaders, row))
      .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    console.log("[ACE_III] evaluations found for patient:", evaluations.length);

    // ─── 4. Tamizaje Cognitivo (only if patient has this assessment) ───
    let tamizaje: TamizajeEvaluation[] = [];
    const hasTamizaje = patient.pruebas.includes("Tamizaje_Cognitivo");
    console.log("[Tamizaje] patient.pruebas includes Tamizaje_Cognitivo:", hasTamizaje);

    if (hasTamizaje) {
      try {
        const tamRows = await getSheetData("Tamizaje_Cognitivo");
        console.log("[Tamizaje] sheet rows fetched:", tamRows?.length ?? 0);
        const tamHeaders = getHeaders(tamRows, "Tamizaje_Cognitivo");
        console.log("[Tamizaje] headers:", JSON.stringify(tamHeaders));
        const tamDataRows = getDataRows(tamRows, "Tamizaje_Cognitivo");
        console.log("[Tamizaje] data rows:", tamDataRows.length);
        console.log("[Tamizaje] patientId to match:", JSON.stringify(patientId));

        // Log the first row's parsed ID_Paciente field so we can see what the sheet actually has
        if (tamDataRows.length > 0) {
          const firstRow = rowToObject(tamHeaders, tamDataRows[0]);
          console.log("[Tamizaje] first row ID_Paciente:", JSON.stringify(firstRow["ID_Paciente"]),
            "| ID Paciente (space):", JSON.stringify(firstRow["ID Paciente"]));
        }

        // Use rowToObject for filtering — same approach used inside parseTamizaje,
        // so trimming and key normalisation are applied consistently.
        // Also accept "ID Paciente" (space) as a fallback header name.
        tamizaje = tamDataRows
          .filter((row) => {
            const r = rowToObject(tamHeaders, row);
            const rowId = (r["ID_Paciente"] || r["ID Paciente"] || "").trim();
            return rowId === patientId;
          })
          .map((row) => parseTamizaje(tamHeaders, row))
          .sort((a, b) => parseDate(a.fecha).getTime() - parseDate(b.fecha).getTime());

        console.log("[Tamizaje] evaluations matched for patient:", tamizaje.length);
      } catch (err) {
        console.error("[Tamizaje] Error fetching Tamizaje_Cognitivo sheet:", err);
      }
    }

    // ─── 5. Sesiones ───
    const sesRows = allData["Sesiones"];
    const sesHeaders = getHeaders(sesRows, "Sesiones");
    const sesDataRows = getDataRows(sesRows, "Sesiones");
    const sesIdCol = sesHeaders.findIndex((h) => h.trim() === "ID Paciente");

    const sessions: Session[] = sesDataRows
      .filter((row) => (row[sesIdCol] || "").trim() === patientId)
      .map((row) => parseSession(sesHeaders, row))
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

    // ─── 6. Victorias (filtrar: Visible para familia = Si) ───
    const vicRows = allData["Victorias"];
    const vicHeaders = getHeaders(vicRows, "Victorias");
    const vicDataRows = getDataRows(vicRows, "Victorias");
    const vicIdCol = vicHeaders.findIndex((h) => h.trim() === "ID Paciente");
    const vicVisibleCol = vicHeaders.findIndex((h) => h.trim() === "Visible para familia");

    const victories: Victory[] = vicDataRows
      .filter((row) => {
        const isPatient = (row[vicIdCol] || "").trim() === patientId;
        const isVisible = vicVisibleCol === -1 || (row[vicVisibleCol] || "").trim().toLowerCase() === "si";
        return isPatient && isVisible;
      })
      .map((row) => parseVictory(vicHeaders, row));

    // ─── 7. Recomendaciones (filtrar: Estado = Activa + Visible = Si) ───
    const recRows = allData["Recomendaciones"];
    const recHeaders = getHeaders(recRows, "Recomendaciones");
    const recDataRows = getDataRows(recRows, "Recomendaciones");
    const recIdCol = recHeaders.findIndex((h) => h.trim() === "ID Paciente");
    const recEstadoCol = recHeaders.findIndex((h) => h.trim() === "Estado");
    const recVisibleCol = recHeaders.findIndex((h) => h.trim() === "Visible para familia");

    const recommendations: Recommendation[] = recDataRows
      .filter((row) => {
        const isPatient = (row[recIdCol] || "").trim() === patientId;
        const isActive = recEstadoCol === -1 || (row[recEstadoCol] || "").trim().toLowerCase() === "activa";
        const isVisible = recVisibleCol === -1 || (row[recVisibleCol] || "").trim().toLowerCase() === "si";
        return isPatient && isActive && isVisible;
      })
      .map((row) => parseRecommendation(recHeaders, row));

    // ─── 8. Calcular dominios ───
    const domains = calculateDomains(evaluations);

    // ─── 9. Guias ───
    const guiasRows = allData["Guias"] || [];
    const guiasHeaders = getHeaders(guiasRows, "Guias");
    const guiasDataRows = getDataRows(guiasRows, "Guias");

    const driveMap = await buildDriveFileMap(
      process.env.APPSHEET_DRIVE_FOLDER_ID || ""
    );

    const guides: Guide[] = guiasDataRows
      .map((row) => parseGuide(guiasHeaders, row, patientId, driveMap))
      .filter((g): g is Guide => g !== null)
      .sort((a, b) => parseDate(b.fecha).getTime() - parseDate(a.fecha).getTime());

    return {
      patient,
      familyInfo,
      evaluations,
      tamizaje,
      sessions,
      victories,
      recommendations,
      domains,
      guides,
    };
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return null;
  }
}
