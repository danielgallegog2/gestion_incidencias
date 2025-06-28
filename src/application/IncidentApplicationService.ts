import { Incident } from "../domain/Incident";
import { IncidentPort } from "../domain/IncidentPort";

/*
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
  async deleteIncident(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("El ID de la incidencia debe ser un número positivo");
    }

    // Verificar que la incidencia existe
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    if (existingIncident.estado !== "cerrada") {
      throw new Error("Solo se pueden eliminar incidencias cerradas");
    }

    return await this.port.deleteIncident(id);
  }
  private port: IncidentPort;

  constructor(port: IncidentPort) {
    this.port = port;
  }

  async createIncident(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<number> {
    this.validateIncidentData(incident);

    const incidentToCreate = {
      ...incident,
      titulo: incident.titulo.trim(),
      descripcion: incident.descripcion?.trim(),
      estado: incident.estado || ("abierta" as const), // Por defecto abierta
    };

    await this.validateReferences(incidentToCreate);

    return await this.port.createIncident(incidentToCreate);
  }

  async getIncidentById(
    id: number,
    includeRelations: boolean = false
  ): Promise<Incident | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la incidencia debe ser un número positivo");
    }

    return await this.port.getIncidentById(id, includeRelations);
  }

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
    if (filters) {
      this.validateFilters(filters);
    }

    return await this.port.getAllIncidents(filters, includeRelations);
  }

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

  async changeIncidentStatus(
    id: number,
    nuevoEstado: "abierta" | "en_progreso" | "cerrada"
  ): Promise<boolean> {
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    this.validateStatusTransition(existingIncident.estado, nuevoEstado);

    return await this.port.changeIncidentStatus(id, nuevoEstado);
  }

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

  private validateDescription(descripcion?: string): void {
    if (descripcion && descripcion.length > 5000) {
      throw new Error("La descripción no puede exceder los 5000 caracteres");
    }
  }

  private validateStatusTransition(
    estadoActual: "abierta" | "en_progreso" | "cerrada",
    nuevoEstado: "abierta" | "en_progreso" | "cerrada"
  ): void {
    const transicionesValidas = {
      abierta: ["en_progreso", "cerrada"],
      en_progreso: ["abierta", "cerrada"],
      cerrada: ["abierta"],
    };

    if (!transicionesValidas[estadoActual].includes(nuevoEstado)) {
      throw new Error(
        `No se puede cambiar de estado "${estadoActual}" a "${nuevoEstado}"`
      );
    }
  }

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

  private async validateReferences(
    incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<void> {
    if (incident.soporteId && incident.soporteId === incident.usuarioId) {
      throw new Error(
        "El usuario reportador no puede ser el mismo que el técnico de soporte"
      );
    }
  }
}
