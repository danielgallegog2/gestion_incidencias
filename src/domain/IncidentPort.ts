import { Incident } from "./Incident";

/**
 * Puerto (interface) que define las operaciones disponibles para las incidencias
 * Implementa el patrón Port en la arquitectura hexagonal
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que quiera implementar la persistencia de incidencias
 *
 * Principios aplicados:
 * - Inversión de dependencias: El dominio define la interfaz
 * - Separación de responsabilidades: Solo operaciones de persistencia
 * - Abstracción: No depende de implementación específica
 */
export interface IncidentPort {
  createIncident(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<number>;
  getIncidentById(
    id: number,
    includeRelations?: boolean
  ): Promise<Incident | null>;
  getAllIncidents(
    filters?: {
      estado?: "abierta" | "en_progreso" | "cerrada";
      usuarioId?: number;
      soporteId?: number;
      categoriaId?: number;
      prioridadId?: number;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
    includeRelations?: boolean
  ): Promise<Incident[]>;
  getIncidentsBySupport(
    soporteId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations?: boolean
  ): Promise<Incident[]>;
  getIncidentsByUser(
    usuarioId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations?: boolean
  ): Promise<Incident[]>;
  getIncidentsByCategory(
    categoriaId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations?: boolean
  ): Promise<Incident[]>;
  getIncidentsByPriority(
    prioridadId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations?: boolean
  ): Promise<Incident[]>;
  updateIncident(
    id: number,
    incident: Partial<Omit<Incident, "id" | "creadoEn">>
  ): Promise<boolean>;
  changeIncidentStatus(
    id: number,
    estado: "abierta" | "en_progreso" | "cerrada"
  ): Promise<boolean>;
  assignIncident(id: number, soporteId: number | null): Promise<boolean>;
  deleteIncident(id: number): Promise<boolean>;
  getIncidentStatistics(filters?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    usuarioId?: number;
    categoriaId?: number;
  }): Promise<{
    total: number;
    abiertas: number;
    enProgreso: number;
    cerradas: number;
    porCategoria: { [key: string]: number };
    porPrioridad: { [key: string]: number };
    tiempoPromedioResolucion?: number; // en horas
  }>;
}
