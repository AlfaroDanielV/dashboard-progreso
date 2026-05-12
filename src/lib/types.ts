// src/lib/types.ts

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  gender: string;
  education: number;
  occupation: string;
  diagnosis: string;
  referringDoctor: string;
  startDate: string;
  status: string;
  interventionAreas: string;
  modality: string;
  familyContact: string;
  token: string;
  pruebas: string[]; // e.g. ["ACE_III"], ["Tamizaje_Cognitivo"], or both
}

export interface ACEEvaluation {
  patientId: string;
  idACE: string;
  date: string;
  type: string;
  // Atención (max 18)
  orientacionTemporal: number;
  orientacionEspacial: number;
  registro3Palabras: number;
  sustraccionSerial: number;
  // Memoria (max 26)
  recuerdo3Palabras: number;
  nombreDireccionAprendizaje: number;
  personajesFamosos: number;
  recuerdoNombreDireccion: number;
  reconocimiento: number;
  // Fluencia (max 14)
  formalLetraP: number;
  categorialAnimales: number;
  // Lenguaje (max 26)
  comprensionOrdenes: number;
  escritura: number;
  repeticionPalabras: number;
  repeticionFrases: number;
  denominacion: number;
  asociacion: number;
  lectura: number;
  // Visuoespacial (max 16)
  conteoPuntos: number;
  identificarLetras: number;
  copiarDiagrama: number;
  copiarDibujo: number;
  reloj: number;
  // Calculados
  totalACE: number;
  // Dominios calculados
  atencion: number;
  memoria: number;
  fluencia: number;
  lenguaje: number;
  visuoespacial: number;
}

export interface TamizajeEvaluation {
  evalId: string;
  fecha: string;
  examinador: string;
  informacionOrientacion: number | null;
  habilidadMental: number | null;
  psicomotricidad: number | null;
  gradoDeterioroCognitivo: number | null;  // CAS Total /35
  denominacion: number | null;
  repeticion: number | null;
  comprension: number | null;
  dibujoReloj: number | null;
  observaciones: string;
}

export interface Session {
  id: string;
  patientId: string;
  date: string;
  sessionNumber: number;
  area: string;
  objectives: string;
  activities: string;
  observations: string;
  nextPlan: string;
  duration: number;
}

export interface Victory {
  id: string;
  date: string;
  text: string;
  area: string;
  evidence: string;
}

export interface Recommendation {
  id: string;
  area: string;
  activity: string;
  frequency: string;
  notes: string;
}

export interface DomainProgress {
  domain: string;
  max: number;
  initial: number;
  current: number;
  icon: string;
  desc: string;
}



export interface FamilyInfo {
  id: string;
  patientId: string;
  personalMessage: string;
  nextSession: string;
  totalSessionsPlan: number;
  sessionsCompleted: number;
  familyNotes: string;
  token: string;
}
export interface Guide {
  id: string;
  titulo: string;
  descripcion: string;
  archivoUrl: string;
  fecha: string;
}

export interface DashboardData {
  patient: Patient;
  familyInfo: FamilyInfo;
  evaluations: ACEEvaluation[];
  tamizaje: TamizajeEvaluation[];
  sessions: Session[];
  victories: Victory[];
  recommendations: Recommendation[];
  domains: DomainProgress[];
  guides: Guide[];
}
