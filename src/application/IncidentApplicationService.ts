// application/IncidentApplicationService.ts
import { Incident } from "../domain/Incident";
import { IncidentPort } from "../domain/IncidentPort";

/**
 * Servicio de aplicación para la gestión de incidencias
 * Implementa la lógica de negocio y casos de uso relacionados con incidencias
 *
 * Responsabilidades:
 * - Validación de reglas de negocio específicas para incidencias
 * - Coordinación entre el dominio y la infraestructura
 * - Manejo de excepciones y errores de negocio
 * - Aplicación de políticas empresariales para gestión de incidencias
 * - Validación de permisos y roles de usuario
 */
export class IncidentApplicationService {
  /**
   * Elimina una incidencia del sistema
   * @param id - Identificador de la incidencia a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si la incidencia no existe o no se puede eliminar
   */
  async deleteIncident(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("El ID de la incidencia debe ser un número positivo");
    }

    // Verificar que la incidencia existe
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    // Aplicar reglas de negocio para eliminación
    // Por ejemplo: solo permitir eliminar incidencias cerradas
    if (existingIncident.estado !== "cerrada") {
      throw new Error("Solo se pueden eliminar incidencias cerradas");
    }

    // Delegar al puerto para realizar la eliminación
    return await this.port.deleteIncident(id);
  }
  private port: IncidentPort;

  /**
   * Constructor que recibe el puerto de incidencias
   * Implementa el patrón de inversión de dependencias
   * @param port - Implementación del puerto de incidencias
   */
  constructor(port: IncidentPort) {
    this.port = port;
  }

  /**
   * Crea una nueva incidencia aplicando validaciones de negocio
   * @param incident - Datos de la incidencia a crear
   * @returns Promise<number> - ID de la incidencia creada
   * @throws Error si la incidencia no cumple las validaciones
   */
  async createIncident(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<number> {
    // Validación de datos de entrada
    this.validateIncidentData(incident);

    // Aplicar reglas de negocio
    const incidentToCreate = {
      ...incident,
      titulo: incident.titulo.trim(),
      descripcion: incident.descripcion?.trim(),
      estado: incident.estado || ("abierta" as const), // Por defecto abierta
    };

    // Validar que las referencias existan (esto se podría implementar con servicios adicionales)
    await this.validateReferences(incidentToCreate);    

    return await this.port.createIncident(incidentToCreate);
  }

  /**
   * Obtiene una incidencia por su ID
   * @param id - Identificador de la incidencia
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident | null> - Incidencia encontrada o null
   * @throws Error si el ID no es válido
   */
  async getIncidentById(
    id: number,
    includeRelations: boolean = false
  ): Promise<Incident | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la incidencia debe ser un número positivo");
    }

    return await this.port.getIncidentById(id, includeRelations);
  }

  /**
   * Obtiene todas las incidencias con filtros opcionales
   * @param filters - Filtros para la búsqueda
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias
   */
  async getAllIncidents(
    filters?: {
      estado?: "abierta" | "en_progreso" | "cerrada";
      usuarioId?: number;
      soporteId?: number;
      categoriaId?: number;
      prioridadId?: number;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
    includeRelations: boolean = false
  ): Promise<Incident[]> {
    // Validar filtros si se proporcionan
    if (filters) {
      this.validateFilters(filters);
    }

    return await this.port.getAllIncidents(filters, includeRelations);
  }

  /**
   * Obtiene incidencias asignadas a un técnico de soporte
   * @param soporteId - ID del técnico de soporte
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias asignadas
   */
  async getIncidentsBySupport(
    soporteId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<Incident[]> {
    if (!soporteId || soporteId <= 0) {
      throw new Error(
        "El ID del técnico de soporte debe ser un número positivo"
      );
    }

    return await this.port.getIncidentsBySupport(
      soporteId,
      estado,
      includeRelations
    );
  }

  /**
   * Obtiene incidencias reportadas por un usuario
   * @param usuarioId - ID del usuario
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias del usuario
   */
  async getIncidentsByUser(
    usuarioId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<Incident[]> {
    if (!usuarioId || usuarioId <= 0) {
      throw new Error("El ID del usuario debe ser un número positivo");
    }

    return await this.port.getIncidentsByUser(
      usuarioId,
      estado,
      includeRelations
    );
  }

  /**
   * Obtiene incidencias por categoría
   * @param categoriaId - ID de la categoría
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias de la categoría
   */
  async getIncidentsByCategory(
    categoriaId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<Incident[]> {
    if (!categoriaId || categoriaId <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    return await this.port.getIncidentsByCategory(
      categoriaId,
      estado,
      includeRelations
    );
  }

  /**
   * Obtiene incidencias por prioridad
   * @param prioridadId - ID de la prioridad
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<Incident[]> - Array de incidencias de la prioridad
   */
  async getIncidentsByPriority(
    prioridadId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<Incident[]> {
    if (!prioridadId || prioridadId <= 0) {
      throw new Error("El ID de la prioridad debe ser un número positivo");
    }

    return await this.port.getIncidentsByPriority(
      prioridadId,
      estado,
      includeRelations
    );
  }

  /**
   * Actualiza una incidencia existente
   * @param id - Identificador de la incidencia
   * @param incident - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si la incidencia no existe o los datos no son válidos
   */
  async updateIncident(
    id: number,
    incident: Partial<Omit<Incident, "id" | "creadoEn">>
  ): Promise<boolean> {
    // Validar que la incidencia existe
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    // Validar datos de actualización
    if (incident.titulo) {
      this.validateTitle(incident.titulo);
    }

    if (incident.descripcion !== undefined) {
      this.validateDescription(incident.descripcion);
    }

    if (incident.estado) {
      this.validateStatusTransition(existingIncident.estado, incident.estado);
    }

    // Preparar datos para actualización
    const incidentToUpdate: Partial<Omit<Incident, "id" | "creadoEn">> = {};

    if (incident.titulo) incidentToUpdate.titulo = incident.titulo.trim();
    if (incident.descripcion !== undefined)
      incidentToUpdate.descripcion = incident.descripcion?.trim();
    if (incident.estado) incidentToUpdate.estado = incident.estado;
    if (incident.soporteId !== undefined)
      incidentToUpdate.soporteId = incident.soporteId;
    if (incident.categoriaId)
      incidentToUpdate.categoriaId = incident.categoriaId;
    if (incident.prioridadId)
      incidentToUpdate.prioridadId = incident.prioridadId;

    return await this.port.updateIncident(id, incidentToUpdate);
  }

  /**
   * Cambia el estado de una incidencia con validaciones de transición
   * @param id - Identificador de la incidencia
   * @param nuevoEstado - Nuevo estado de la incidencia
   * @returns Promise<boolean> - true si se cambió correctamente
   * @throws Error si la transición no es válida
   */
  async changeIncidentStatus(
    id: number,
    nuevoEstado: "abierta" | "en_progreso" | "cerrada"
  ): Promise<boolean> {
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    // Validar transición de estado
    this.validateStatusTransition(existingIncident.estado, nuevoEstado);

    return await this.port.changeIncidentStatus(id, nuevoEstado);
  }

  /**
   * Asigna una incidencia a un técnico de soporte
   * @param id - Identificador de la incidencia
   * @param soporteId - ID del técnico (null para desasignar)
   * @returns Promise<boolean> - true si se asignó correctamente
   * @throws Error si la incidencia no existe
   */
  async assignIncident(id: number, soporteId: number | null): Promise<boolean> {
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    // Validar que no se puede asignar una incidencia cerrada
    if (existingIncident.estado === "cerrada") {
      throw new Error("No se puede asignar una incidencia cerrada");
    }

    // Si se asigna por primera vez, cambiar estado a "en_progreso"
    if (soporteId && !existingIncident.soporteId) {
      await this.port.changeIncidentStatus(id, "en_progreso");
    }

    return await this.port.assignIncident(id, soporteId);
  }

  /**
   * Obtiene estadísticas de incidencias
   * @param filters - Filtros opcionales para las estadísticas
   * @returns Promise<object> - Estadísticas calculadas
   */
  async getIncidentStatistics(filters?: {
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
    tiempoPromedioResolucion?: number;
  }> {
    if (filters) {
      this.validateStatisticsFilters(filters);
    }

    return await this.port.getIncidentStatistics(filters);
  }

  /**
   * MÉTODOS PRIVADOS DE VALIDACIÓN
   */

  /**
   * Valida los datos básicos de una incidencia
   * @param incident - Datos de la incidencia a validar
   * @throws Error si los datos no son válidos
   */
  private validateIncidentData(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): void {
    if (!incident.titulo || incident.titulo.trim().length === 0) {
      throw new Error("El título de la incidencia es obligatorio");
    }

    this.validateTitle(incident.titulo);

    if (incident.descripcion !== undefined) {
      this.validateDescription(incident.descripcion);
    }

    if (!incident.usuarioId || incident.usuarioId <= 0) {
      throw new Error(
        "El ID del usuario reportador es obligatorio y debe ser válido"
      );
    }

    if (!incident.categoriaId || incident.categoriaId <= 0) {
      throw new Error("El ID de la categoría es obligatorio y debe ser válido");
    }

    if (!incident.prioridadId || incident.prioridadId <= 0) {
      throw new Error("El ID de la prioridad es obligatorio y debe ser válido");
    }

    if (incident.soporteId !== undefined && incident.soporteId <= 0) {
      throw new Error("El ID del técnico de soporte debe ser válido");
    }

    if (
      incident.estado &&
      !["abierta", "en_progreso", "cerrada"].includes(incident.estado)
    ) {
      throw new Error("El estado debe ser: abierta, en_progreso o cerrada");
    }
  }

  /**
   * Valida el formato del título de la incidencia
   * @param titulo - Título a validar
   * @throws Error si el título no cumple con los criterios
   */
  private validateTitle(titulo: string): void {
    if (titulo.length < 5) {
      throw new Error("El título debe tener al menos 5 caracteres");
    }

    if (titulo.length > 150) {
      throw new Error("El título no puede exceder los 150 caracteres");
    }

    // Validar que contenga caracteres válidos
    const titleRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_.,;:()\[\]]+$/;
    if (!titleRegex.test(titulo)) {
      throw new Error("El título contiene caracteres no válidos");
    }
  }

  /**
   * Valida la descripción de la incidencia
   * @param descripcion - Descripción a validar (puede ser undefined)
   * @throws Error si la descripción no es válida
   */
  private validateDescription(descripcion?: string): void {
    if (descripcion && descripcion.length > 5000) {
      throw new Error("La descripción no puede exceder los 5000 caracteres");
    }
  }

  /**
   * Valida las transiciones de estado permitidas
   * @param estadoActual - Estado actual de la incidencia
   * @param nuevoEstado - Nuevo estado propuesto
   * @throws Error si la transición no es válida
   */
  private validateStatusTransition(
    estadoActual: "abierta" | "en_progreso" | "cerrada",
    nuevoEstado: "abierta" | "en_progreso" | "cerrada"
  ): void {
    // Definir transiciones válidas
    const transicionesValidas = {
      abierta: ["en_progreso", "cerrada"],
      en_progreso: ["abierta", "cerrada"],
      cerrada: ["abierta"], // Solo permitir reabrir en casos especiales
    };

    if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
      throw new Error(
        `No se puede cambiar de estado "${estadoActual}" a "${nuevoEstado}"`
      );
    }
  }

  /**
   * Valida los filtros de búsqueda
   * @param filters - Filtros a validar
   * @throws Error si algún filtro no es válido
   */
  private validateFilters(filters: {
    estado?: "abierta" | "en_progreso" | "cerrada";
    usuarioId?: number;
    soporteId?: number;
    categoriaId?: number;
    prioridadId?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
  }): void {
    if (filters.usuarioId !== undefined && filters.usuarioId <= 0) {
      throw new Error("El ID del usuario debe ser un número positivo");
    }

    if (filters.soporteId !== undefined && filters.soporteId <= 0) {
      throw new Error(
        "El ID del técnico de soporte debe ser un número positivo"
      );
    }

    if (filters.categoriaId !== undefined && filters.categoriaId <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    if (filters.prioridadId !== undefined && filters.prioridadId <= 0) {
      throw new Error("El ID de la prioridad debe ser un número positivo");
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      if (filters.fechaDesde > filters.fechaHasta) {
        throw new Error(
          "La fecha de inicio no puede ser mayor que la fecha de fin"
        );
      }
    }

    if (
      filters.estado &&
      !["abierta", "en_progreso", "cerrada"].includes(filters.estado)
    ) {
      throw new Error("El estado debe ser: abierta, en_progreso o cerrada");
    }
  }

  /**
   * Valida los filtros para estadísticas
   * @param filters - Filtros de estadísticas a validar
   * @throws Error si algún filtro no es válido
   */
  private validateStatisticsFilters(filters: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    usuarioId?: number;
    categoriaId?: number;
  }): void {
    if (filters.usuarioId !== undefined && filters.usuarioId <= 0) {
      throw new Error("El ID del usuario debe ser un número positivo");
    }

    if (filters.categoriaId !== undefined && filters.categoriaId <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      if (filters.fechaDesde > filters.fechaHasta) {
        throw new Error(
          "La fecha de inicio no puede ser mayor que la fecha de fin"
        );
      }
    }
  }

  /**
   * Valida que las referencias a otras entidades existan
   * Nota: Esta validación podría implementarse consultando otros servicios
   * @param incident - Datos de la incidencia con referencias
   * @throws Error si alguna referencia no es válida
   */
  private async validateReferences(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<void> {
    // TODO: Implementar validaciones de existencia de referencias
    // - Validar que el usuario existe y está activo
    // - Validar que la categoría existe y está activa
    // - Validar que la prioridad existe y está activa
    // - Si hay soporteId, validar que el usuario existe y tiene rol de soporte

    // Por ahora, solo validación básica
    if (incident.soporteId && incident.soporteId === incident.usuarioId) {
      throw new Error(
        "El usuario reportador no puede ser el mismo que el técnico de soporte"
      );
    }
  }
}
