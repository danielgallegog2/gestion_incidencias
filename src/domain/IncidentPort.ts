// domain/IncidentPort.ts
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
  /**
   * Crea una nueva incidencia en el sistema
   * @param incident - Datos de la incidencia sin ID y fechas (se generan automáticamente)
   * @returns Promise<number> - ID de la incidencia creada
   * @throws Error si hay problemas de validación o creación
   */
  createIncident(incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">): Promise<number>;

  /**
   * Obtiene una incidencia específica por su ID
   * @param id - Identificador único de la incidencia
   * @param includeRelations - Si incluir datos relacionados (usuario, categoría, etc.)
   * @returns Promise<Incident | null> - Incidencia encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getIncidentById(id: number, includeRelations?: boolean): Promise<Incident | null>;

  /**
   * Obtiene todas las incidencias del sistema con filtros opcionales
   * @param filters - Filtros opcionales para la búsqueda
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias que cumplen los filtros
   * @throws Error si hay problemas de conexión o consulta
   */
  getAllIncidents(filters?: {
    estado?: "abierta" | "en_progreso" | "cerrada";
    usuarioId?: number;
    soporteId?: number;
    categoriaId?: number;
    prioridadId?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }, includeRelations?: boolean): Promise<Incident[]>;

  /**
   * Obtiene incidencias asignadas a un técnico específico
   * @param soporteId - ID del técnico de soporte
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias asignadas al técnico
   * @throws Error si hay problemas de conexión o consulta
   */
  getIncidentsBySupport(soporteId: number, estado?: "abierta" | "en_progreso" | "cerrada", includeRelations?: boolean): Promise<Incident[]>;

  /**
   * Obtiene incidencias reportadas por un usuario específico
   * @param usuarioId - ID del usuario que reportó
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias reportadas por el usuario
   * @throws Error si hay problemas de conexión o consulta
   */
  getIncidentsByUser(usuarioId: number, estado?: "abierta" | "en_progreso" | "cerrada", includeRelations?: boolean): Promise<Incident[]>;

  /**
   * Obtiene incidencias por categoría
   * @param categoriaId - ID de la categoría
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias de la categoría
   * @throws Error si hay problemas de conexión o consulta
   */
  getIncidentsByCategory(categoriaId: number, estado?: "abierta" | "en_progreso" | "cerrada", includeRelations?: boolean): Promise<Incident[]>;

  /**
   * Obtiene incidencias por nivel de prioridad
   * @param prioridadId - ID de la prioridad
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias con la prioridad especificada
   * @throws Error si hay problemas de conexión o consulta
   */
  getIncidentsByPriority(prioridadId: number, estado?: "abierta" | "en_progreso" | "cerrada", includeRelations?: boolean): Promise<Incident[]>;

  /**
   * Actualiza los datos de una incidencia existente
   * @param id - Identificador de la incidencia a actualizar
   * @param incident - Datos parciales de la incidencia a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente, false si no existe
   * @throws Error si hay problemas de validación o conexión
   */
  updateIncident(id: number, incident: Partial<Omit<Incident, "id" | "creadoEn">>): Promise<boolean>;

  /**
   * Cambia el estado de una incidencia
   * @param id - Identificador de la incidencia
   * @param estado - Nuevo estado de la incidencia
   * @returns Promise<boolean> - true si se actualizó correctamente, false si no existe
   * @throws Error si hay problemas de validación o conexión
   */
  changeIncidentStatus(id: number, estado: "abierta" | "en_progreso" | "cerrada"): Promise<boolean>;

  /**
   * Asigna una incidencia a un técnico de soporte
   * @param id - Identificador de la incidencia
   * @param soporteId - ID del técnico a asignar (null para desasignar)
   * @returns Promise<boolean> - true si se asignó correctamente, false si no existe
   * @throws Error si hay problemas de validación o conexión
   */
  assignIncident(id: number, soporteId: number | null): Promise<boolean>;

  /**
   * Elimina una incidencia del sistema (eliminación física)
   * Nota: Se recomienda cambiar estado a "cerrada" en lugar de eliminar
   * @param id - Identificador de la incidencia a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente, false si no existe
   * @throws Error si hay problemas de conexión o la incidencia tiene comentarios
   */
  deleteIncident(id: number): Promise<boolean>;

  /**
   * Obtiene estadísticas de incidencias
   * @param filters - Filtros opcionales para las estadísticas
   * @returns Promise<object> - Objeto con estadísticas calculadas
   * @throws Error si hay problemas de conexión o consulta
   */
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