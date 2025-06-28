// controllers/IncidentController.ts
import { IncidentApplicationService } from "../../application/IncidentApplicationService";
import { Incident } from "../../domain/Incident";
import { Request, Response } from "express";

/**
 * Controlador para manejar las peticiones HTTP relacionadas con incidencias
 * Actúa como capa de presentación en la arquitectura hexagonal
 *
 * Responsabilidades:
 * - Recibir y validar peticiones HTTP específicas para incidencias
 * - Transformar datos de entrada y salida
 * - Manejar errores y códigos de respuesta HTTP
 * - Delegar la lógica de negocio al servicio de aplicación
 * - Gestionar parámetros de consulta y filtros
 */
export class IncidentController {
  private app: IncidentApplicationService;
  incidentRepository: any;

  /**
   * Constructor que recibe el servicio de aplicación de incidencias
   * Implementa el patrón de inyección de dependencias
   * @param app - Servicio de aplicación de incidencias
   */
  constructor(app: IncidentApplicationService) {
    this.app = app;
  }

  /**
   * Crea una nueva incidencia
   * Endpoint: POST /incidents
   * @param req - Request con los datos de la incidencia en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async createIncident(req: Request, res: Response): Promise<Response> {
    const {
      titulo,
      descripcion,
      usuarioId,
      categoriaId,
      prioridadId,
      soporteId,
    } = req.body;

    try {
      // Validaciones básicas de entrada
      if (!titulo || titulo.trim().length === 0) {
        return res.status(400).json({
          error: "El título de la incidencia es obligatorio",
        });
      }

      if (!usuarioId || !Number.isInteger(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({
          error:
            "El ID del usuario reportador es obligatorio y debe ser válido",
        });
      }

      if (!categoriaId || !Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({
          error: "El ID de la categoría es obligatorio y debe ser válido",
        });
      }

      if (!prioridadId || !Number.isInteger(prioridadId) || prioridadId <= 0) {
        return res.status(400).json({
          error: "El ID de la prioridad es obligatorio y debe ser válido",
        });
      }

      // Validaciones adicionales del formato
      if (titulo.length < 5 || titulo.length > 150) {
        return res.status(400).json({
          error: "El título debe tener entre 5 y 150 caracteres",
        });
      }

      if (descripcion && descripcion.length > 5000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 5000 caracteres",
        });
      }

      if (
        soporteId !== undefined &&
        (!Number.isInteger(soporteId) || soporteId <= 0)
      ) {
        return res.status(400).json({
          error: "El ID del técnico de soporte debe ser válido",
        });
      }

      // Preparar objeto de incidencia para crear
      const incident: Omit<Incident, "id" | "creadoEn" | "actualizadoEn"> = {
        titulo: titulo.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        estado: "abierta", // Por defecto abierta
        usuarioId: usuarioId,
        soporteId: soporteId || undefined,
        categoriaId: categoriaId,
        prioridadId: prioridadId,
      };

      // Delegar al servicio de aplicación
      const incidentId = await this.app.createIncident(incident);

      return res.status(201).json({
        message: "Incidencia creada exitosamente",
        incidentId,
        incident: {
          id: incidentId,
          ...incident,
        },
      });
    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        // Errores de negocio (validaciones, referencias, etc.)
        if (
          error.message.includes("obligatorio") ||
          error.message.includes("válido") ||
          error.message.includes("caracteres") ||
          error.message.includes("no existe")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        // Errores del servidor
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene una incidencia por su ID
   * Endpoint: GET /incidents/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la incidencia encontrada
   */
  async getIncidentById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const includeRelations = req.query.include === "relations";

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      // Delegar al servicio de aplicación
      const incident = await this.app.getIncidentById(id, includeRelations);

      if (!incident) {
        return res.status(404).json({
          error: "Incidencia no encontrada",
        });
      }

      return res.status(200).json({
        message: "Incidencia encontrada",
        incident,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene todas las incidencias con filtros opcionales
   * Endpoint: GET /incidents
   * @param req - Request con query parameters para filtros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las incidencias
   */
  async getAllIncidents(req: Request, res: Response): Promise<Response> {
    try {
      const includeRelations = req.query.include === "relations";

      // Extraer filtros de query parameters
      const filters: any = {};

      if (req.query.estado) {
        const estado = req.query.estado as string;
        if (!["abierta", "en_progreso", "cerrada"].includes(estado)) {
          return res.status(400).json({
            error: "El estado debe ser: abierta, en_progreso o cerrada",
          });
        }
        filters.estado = estado;
      }

      if (req.query.usuarioId) {
        const usuarioId = parseInt(req.query.usuarioId as string);
        if (isNaN(usuarioId) || usuarioId <= 0) {
          return res.status(400).json({
            error: "El ID del usuario debe ser un número positivo",
          });
        }
        filters.usuarioId = usuarioId;
      }

      if (req.query.soporteId) {
        const soporteId = parseInt(req.query.soporteId as string);
        if (isNaN(soporteId) || soporteId <= 0) {
          return res.status(400).json({
            error: "El ID del técnico de soporte debe ser un número positivo",
          });
        }
        filters.soporteId = soporteId;
      }

      if (req.query.categoriaId) {
        const categoriaId = parseInt(req.query.categoriaId as string);
        if (isNaN(categoriaId) || categoriaId <= 0) {
          return res.status(400).json({
            error: "El ID de la categoría debe ser un número positivo",
          });
        }
        filters.categoriaId = categoriaId;
      }

      if (req.query.prioridadId) {
        const prioridadId = parseInt(req.query.prioridadId as string);
        if (isNaN(prioridadId) || prioridadId <= 0) {
          return res.status(400).json({
            error: "El ID de la prioridad debe ser un número positivo",
          });
        }
        filters.prioridadId = prioridadId;
      }

      if (req.query.fechaDesde) {
        const fechaDesde = new Date(req.query.fechaDesde as string);
        if (isNaN(fechaDesde.getTime())) {
          return res.status(400).json({
            error: "La fecha desde no es válida",
          });
        }
        filters.fechaDesde = fechaDesde;
      }

      if (req.query.fechaHasta) {
        const fechaHasta = new Date(req.query.fechaHasta as string);
        if (isNaN(fechaHasta.getTime())) {
          return res.status(400).json({
            error: "La fecha hasta no es válida",
          });
        }
        filters.fechaHasta = fechaHasta;
      }

      // Delegar al servicio de aplicación
      const incidents = await this.app.getAllIncidents(
        Object.keys(filters).length > 0 ? filters : undefined,
        includeRelations
      );

      return res.status(200).json({
        message: "Incidencias obtenidas exitosamente",
        count: incidents.length,
        incidents,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las incidencias",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las incidencias",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene incidencias por usuario
   * Endpoint: GET /incidents/user/:usuarioId
   * @param req - Request con el ID del usuario
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las incidencias del usuario
   */
  async getIncidentsByUser(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = parseInt(req.params.usuarioId);
      const estado = req.query.estado as
        | "abierta"
        | "en_progreso"
        | "cerrada"
        | undefined;
      const includeRelations = req.query.include === "relations";

      if (isNaN(usuarioId) || usuarioId <= 0) {
        return res.status(400).json({
          error: "El ID del usuario debe ser un número positivo válido",
        });
      }

      if (estado && !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      const incidents = await this.app.getIncidentsByUser(
        usuarioId,
        estado,
        includeRelations
      );

      return res.status(200).json({
        message: "Incidencias del usuario obtenidas exitosamente",
        count: incidents.length,
        incidents,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las incidencias del usuario",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las incidencias del usuario",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene incidencias por técnico de soporte
   * Endpoint: GET /incidents/support/:soporteId
   * @param req - Request con el ID del técnico
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las incidencias asignadas
   */
  async getIncidentsBySupport(req: Request, res: Response): Promise<Response> {
    try {
      const soporteId = parseInt(req.params.soporteId);
      const estado = req.query.estado as
        | "abierta"
        | "en_progreso"
        | "cerrada"
        | undefined;
      const includeRelations = req.query.include === "relations";

      if (isNaN(soporteId) || soporteId <= 0) {
        return res.status(400).json({
          error:
            "El ID del técnico de soporte debe ser un número positivo válido",
        });
      }

      if (estado && !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      const incidents = await this.app.getIncidentsBySupport(
        soporteId,
        estado,
        includeRelations
      );

      return res.status(200).json({
        message: "Incidencias del técnico obtenidas exitosamente",
        count: incidents.length,
        incidents,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las incidencias del técnico",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las incidencias del técnico",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene incidencias por categoría
   * Endpoint: GET /incidents/category/:categoriaId
   * @param req - Request con el ID de la categoría
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las incidencias de la categoría
   */
  async getIncidentsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const categoriaId = parseInt(req.params.categoriaId);
      const estado = req.query.estado as
        | "abierta"
        | "en_progreso"
        | "cerrada"
        | undefined;
      const includeRelations = req.query.include === "relations";

      if (isNaN(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({
          error: "El ID de la categoría debe ser un número positivo válido",
        });
      }

      if (estado && !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      const incidents = await this.app.getIncidentsByCategory(
        categoriaId,
        estado,
        includeRelations
      );

      return res.status(200).json({
        message: "Incidencias de la categoría obtenidas exitosamente",
        count: incidents.length,
        incidents,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las incidencias de la categoría",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las incidencias de la categoría",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene incidencias por prioridad
   * Endpoint: GET /incidents/priority/:prioridadId
   * @param req - Request con el ID de la prioridad
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las incidencias de la prioridad
   */
  async getIncidentsByPriority(req: Request, res: Response): Promise<Response> {
    try {
      const prioridadId = parseInt(req.params.prioridadId);
      const estado = req.query.estado as
        | "abierta"
        | "en_progreso"
        | "cerrada"
        | undefined;
      const includeRelations = req.query.include === "relations";

      if (isNaN(prioridadId) || prioridadId <= 0) {
        return res.status(400).json({
          error: "El ID de la prioridad debe ser un número positivo válido",
        });
      }

      if (estado && !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      const incidents = await this.app.getIncidentsByPriority(
        prioridadId,
        estado,
        includeRelations
      );

      return res.status(200).json({
        message: "Incidencias de la prioridad obtenidas exitosamente",
        count: incidents.length,
        incidents,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las incidencias de la prioridad",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las incidencias de la prioridad",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Actualiza una incidencia existente
   * Endpoint: PUT /incidents/:id
   * @param req - Request con el ID en parámetros y datos a actualizar en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado de la actualización
   */
  async updateIncident(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const {
        titulo,
        descripcion,
        estado,
        soporteId,
        categoriaId,
        prioridadId,
      } = req.body;

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      // Validar que al menos un campo se esté actualizando
      if (
        !titulo &&
        descripcion === undefined &&
        !estado &&
        soporteId === undefined &&
        !categoriaId &&
        !prioridadId
      ) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Validaciones específicas de campos
      if (titulo && (titulo.trim().length < 5 || titulo.trim().length > 150)) {
        return res.status(400).json({
          error: "El título debe tener entre 5 y 150 caracteres",
        });
      }

      if (descripcion && descripcion.length > 5000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 5000 caracteres",
        });
      }

      if (estado && !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      if (
        soporteId !== undefined &&
        soporteId !== null &&
        (!Number.isInteger(soporteId) || soporteId <= 0)
      ) {
        return res.status(400).json({
          error: "El ID del técnico de soporte debe ser válido",
        });
      }

      if (categoriaId && (!Number.isInteger(categoriaId) || categoriaId <= 0)) {
        return res.status(400).json({
          error: "El ID de la categoría debe ser válido",
        });
      }

      if (prioridadId && (!Number.isInteger(prioridadId) || prioridadId <= 0)) {
        return res.status(400).json({
          error: "El ID de la prioridad debe ser válido",
        });
      }

      // Preparar objeto de actualización
      const incidentUpdate: Partial<Omit<Incident, "id" | "creadoEn">> = {};

      if (titulo) incidentUpdate.titulo = titulo.trim();
      if (descripcion !== undefined)
        incidentUpdate.descripcion = descripcion
          ? descripcion.trim()
          : undefined;
      if (estado) incidentUpdate.estado = estado;
      if (soporteId !== undefined) incidentUpdate.soporteId = soporteId;
      if (categoriaId) incidentUpdate.categoriaId = categoriaId;
      if (prioridadId) incidentUpdate.prioridadId = prioridadId;

      // Delegar al servicio de aplicación
      const updated = await this.app.updateIncident(id, incidentUpdate);

      if (!updated) {
        return res.status(404).json({
          error: "Incidencia no encontrada o sin cambios",
        });
      }

      return res.status(200).json({
        message: "Incidencia actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        // Errores de negocio
        if (
          error.message.includes("no encontrada") ||
          error.message.includes("transición") ||
          error.message.includes("válido")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Cambia el estado de una incidencia
   * Endpoint: PATCH /incidents/:id/status
   * @param req - Request con el ID y nuevo estado
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async changeIncidentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      if (!estado || !["abierta", "en_progreso", "cerrada"].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser: abierta, en_progreso o cerrada",
        });
      }

      const updated = await this.app.changeIncidentStatus(id, estado);

      if (!updated) {
        return res.status(404).json({
          error: "Incidencia no encontrada",
        });
      }

      return res.status(200).json({
        message: `Estado de la incidencia cambiado a "${estado}" exitosamente`,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("transición") ||
          error.message.includes("no encontrada")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Asigna una incidencia a un técnico de soporte
   * Endpoint: PATCH /incidents/:id/assign
   * @param req - Request con el ID de la incidencia y ID del técnico
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async assignIncident(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { soporteId } = req.body;

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      if (
        soporteId !== null &&
        (!Number.isInteger(soporteId) || soporteId <= 0)
      ) {
        return res.status(400).json({
          error:
            "El ID del técnico de soporte debe ser válido o null para desasignar",
        });
      }

      const assigned = await this.app.assignIncident(id, soporteId);

      if (!assigned) {
        return res.status(404).json({
          error: "Incidencia no encontrada",
        });
      }

      const message = soporteId
        ? `Incidencia asignada al técnico ${soporteId} exitosamente`
        : "Incidencia desasignada exitosamente";

      return res.status(200).json({
        message,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("no encontrada") ||
          error.message.includes("cerrada")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  /**
   * Obtiene estadísticas de incidencias
   * Endpoint: GET /incidents/statistics
   * @param req - Request con filtros opcionales
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las estadísticas
   */
  async getIncidentStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const filters: any = {};

      if (req.query.fechaDesde) {
        const fechaDesde = new Date(req.query.fechaDesde as string);
        if (isNaN(fechaDesde.getTime())) {
          return res.status(400).json({
            error: "La fecha desde no es válida",
          });
        }
        filters.fechaDesde = fechaDesde;
      }

      if (req.query.fechaHasta) {
        const fechaHasta = new Date(req.query.fechaHasta as string);
        if (isNaN(fechaHasta.getTime())) {
          return res.status(400).json({
            error: "La fecha hasta no es válida",
          });
        }
        filters.fechaHasta = fechaHasta;
      }

      if (req.query.usuarioId) {
        const usuarioId = parseInt(req.query.usuarioId as string);
        if (isNaN(usuarioId) || usuarioId <= 0) {
          return res.status(400).json({
            error: "El ID del usuario debe ser un número positivo",
          });
        }
        filters.usuarioId = usuarioId;
      }

      if (req.query.categoriaId) {
        const categoriaId = parseInt(req.query.categoriaId as string);
        if (isNaN(categoriaId) || categoriaId <= 0) {
          return res.status(400).json({
            error: "El ID de la categoría debe ser un número positivo",
          });
        }
        filters.categoriaId = categoriaId;
      }

      const statistics = await this.app.getIncidentStatistics(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      return res.status(200).json({
        message: "Estadísticas obtenidas exitosamente",
        statistics,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las estadísticas",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las estadísticas",
        details: "Error inesperado",
      });
    }
  }


  async deleteIncident(
    req: Request,
    res: Response,
    id: number
  ): Promise<boolean> {
    try {

      const existingIncident = await this.incidentRepository.findOne({
        where: { id_incidencias: id },
      });

      if (!existingIncident) {
        throw new Error("Incidencia no encontrada");
      }

      const deleteResult = await this.incidentRepository.delete({
        id_incidencias: id,
      });

      return deleteResult.affected !== undefined && deleteResult.affected > 0;
    } catch (error) {
      console.error("Error deleting incident:", error);
      throw new Error("Error al eliminar la incidencia");
    }
  }
}
