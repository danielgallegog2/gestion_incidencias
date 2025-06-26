// controllers/PriorityController.ts
import { PriorityApplicationService } from "../../application/PriorityApplicationService";
import { Priority } from '../../domain/Priority';
import { Request, Response } from "express";

/**
 * Controlador para manejar las peticiones HTTP relacionadas con prioridades
 * Actúa como capa de presentación en la arquitectura hexagonal
 * 
 * Responsabilidades:
 * - Recibir y validar peticiones HTTP específicas para prioridades
 * - Transformar datos de entrada y salida
 * - Manejar errores y códigos de respuesta HTTP
 * - Delegar la lógica de negocio al servicio de aplicación
 */
export class PriorityController {
  private app: PriorityApplicationService;

  /**
   * Constructor que recibe el servicio de aplicación de prioridades
   * Implementa el patrón de inyección de dependencias
   * @param app - Servicio de aplicación de prioridades
   */
  constructor(app: PriorityApplicationService) {
    this.app = app;
  }

  /**
   * Crea una nueva prioridad
   * Endpoint: POST /priorities
   * @param req - Request con los datos de la prioridad en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async createPriority(req: Request, res: Response): Promise<Response> {
    const { nombre, descripcion, nivel, color, estado } = req.body;
    
    try {
      // Validaciones básicas de entrada
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ 
          error: "El nombre de la prioridad es obligatorio" 
        });
      }

      if (!nivel || !Number.isInteger(nivel) || nivel <= 0) {
        return res.status(400).json({ 
          error: "El nivel debe ser un número entero positivo" 
        });
      }

      // Validación adicional del formato del nombre
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/;
      if (!nameRegex.test(nombre.trim())) {
        return res.status(400).json({ 
          error: "El nombre de la prioridad contiene caracteres no válidos" 
        });
      }

      // Validación de descripción si se proporciona
      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({ 
          error: "La descripción no puede exceder los 1000 caracteres" 
        });
      }

      // Validación de color si se proporciona
      if (color && !/^#([a-f0-9]{6}|[a-f0-9]{3})$/i.test(color.trim())) {
        return res.status(400).json({ 
          error: "El color debe estar en formato hexadecimal (#RRGGBB o #RGB)" 
        });
      }

      // Validación de estado si se proporciona
      if (estado !== undefined && ![0, 1].includes(estado)) {
        return res.status(400).json({ 
          error: "El estado debe ser 0 (inactiva) o 1 (activa)" 
        });
      }

      // Preparar objeto de prioridad para crear
      const priority: Omit<Priority, "id" | "fechaCreacion"> = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        nivel: nivel,
        color: color ? color.trim().toLowerCase() : undefined,
        estado: estado !== undefined ? estado : 1
      };

      // Delegar al servicio de aplicación
      const priorityId = await this.app.createPriority(priority);

      return res.status(201).json({
        message: "Prioridad creada exitosamente",
        priorityId,
        priority: {
          id: priorityId,
          ...priority
        }
      });

    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        // Errores de negocio (duplicados, validaciones, etc.)
        if (error.message.includes("ya existe") || 
            error.message.includes("obligatorio") ||
            error.message.includes("válido") ||
            error.message.includes("nivel")) {
          return res.status(400).json({
            error: error.message
          });
        }

        // Errores del servidor
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene una prioridad por su ID
   * Endpoint: GET /priorities/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la prioridad encontrada
   */
  async getPriorityById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
          error: "El ID debe ser un número positivo válido" 
        });
      }

      // Delegar al servicio de aplicación
      const priority = await this.app.getPriorityById(id);
      
      if (!priority) {
        return res.status(404).json({ 
          error: "Prioridad no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Prioridad encontrada",
        priority
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene una prioridad por su nombre
   * Endpoint: GET /priorities/by-name/:nombre
   * @param req - Request con el nombre en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la prioridad encontrada
   */
  async getPriorityByName(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre } = req.params;
      
      // Validación del parámetro nombre
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ 
          error: "El nombre de la prioridad no puede estar vacío" 
        });
      }

      // Delegar al servicio de aplicación
      const priority = await this.app.getPriorityByName(nombre);
      
      if (!priority) {
        return res.status(404).json({ 
          error: "Prioridad no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Prioridad encontrada",
        priority
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene una prioridad por su nivel
   * Endpoint: GET /priorities/by-level/:nivel
   * @param req - Request con el nivel en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la prioridad encontrada
   */
  async getPriorityByLevel(req: Request, res: Response): Promise<Response> {
    try {
      const nivel = parseInt(req.params.nivel);
      
      // Validación del parámetro nivel
      if (isNaN(nivel) || nivel <= 0) {
        return res.status(400).json({ 
          error: "El nivel debe ser un número positivo válido" 
        });
      }

      // Delegar al servicio de aplicación
      const priority = await this.app.getPriorityByLevel(nivel);
      
      if (!priority) {
        return res.status(404).json({ 
          error: "Prioridad no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Prioridad encontrada",
        priority
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene todas las prioridades activas ordenadas por nivel
   * Endpoint: GET /priorities/active
   * @param req - Request object
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las prioridades activas
   */
  async getAllActivePriorities(req: Request, res: Response): Promise<Response> {
    try {
      // Delegar al servicio de aplicación
      const priorities = await this.app.getAllActivePriorities();

      return res.status(200).json({
        message: "Prioridades activas obtenidas exitosamente",
        count: priorities.length,
        priorities
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las prioridades activas",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error al obtener las prioridades activas",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene todas las prioridades del sistema
   * Endpoint: GET /priorities
   * @param req - Request object
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con todas las prioridades
   */
  async getAllPriorities(req: Request, res: Response): Promise<Response> {
    try {
      // Delegar al servicio de aplicación
      const priorities = await this.app.getAllPriorities();

      return res.status(200).json({
        message: "Todas las prioridades obtenidas exitosamente",
        count: priorities.length,
        priorities
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las prioridades",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error al obtener las prioridades",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Actualiza una prioridad existente
   * Endpoint: PUT /priorities/:id
   * @param req - Request con el ID en parámetros y datos a actualizar en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado de la actualización
   */
  async updatePriority(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, nivel, color, estado } = req.body;

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
          error: "El ID debe ser un número positivo válido" 
        });
      }

      // Validar que al menos un campo se esté actualizando
      if (!nombre && descripcion === undefined && !nivel && color === undefined && estado === undefined) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar"
        });
      }

      // Validaciones específicas de campos
      if (nombre && (!nombre.trim() || nombre.trim().length === 0)) {
        return res.status(400).json({
          error: "El nombre de la prioridad no puede estar vacío"
        });
      }

      if (nombre && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/.test(nombre.trim())) {
        return res.status(400).json({
          error: "El nombre de la prioridad contiene caracteres no válidos"
        });
      }

      if (nivel && (!Number.isInteger(nivel) || nivel <= 0)) {
        return res.status(400).json({
          error: "El nivel debe ser un número entero positivo"
        });
      }

      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 1000 caracteres"
        });
      }

      if (color && !/^#([a-f0-9]{6}|[a-f0-9]{3})$/i.test(color.trim())) {
        return res.status(400).json({
          error: "El color debe estar en formato hexadecimal (#RRGGBB o #RGB)"
        });
      }

      if (estado !== undefined && ![0, 1].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser 0 (inactiva) o 1 (activa)"
        });
      }

      // Preparar objeto de actualización
      const priorityUpdate: Partial<Priority> = {};
      if (nombre) priorityUpdate.nombre = nombre.trim();
      if (descripcion !== undefined) priorityUpdate.descripcion = descripcion ? descripcion.trim() : undefined;
      if (nivel) priorityUpdate.nivel = nivel;
      if (color !== undefined) priorityUpdate.color = color ? color.trim().toLowerCase() : undefined;
      if (estado !== undefined) priorityUpdate.estado = estado;

      // Delegar al servicio de aplicación
      const updated = await this.app.updatePriority(id, priorityUpdate);

      if (!updated) {
        return res.status(404).json({
          error: "Prioridad no encontrada o sin cambios"
        });
      }

      return res.status(200).json({
        message: "Prioridad actualizada exitosamente"
      });

    } catch (error) {
      if (error instanceof Error) {
        // Errores de negocio
        if (error.message.includes("ya existe") || 
            error.message.includes("no encontrada") ||
            error.message.includes("válido") ||
            error.message.includes("nivel")) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Elimina una prioridad (eliminación lógica)
   * Endpoint: DELETE /priorities/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado de la eliminación
   */
  async deletePriority(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido"
        });
      }

      // Delegar al servicio de aplicación
      const deleted = await this.app.deletePriority(id);

      if (!deleted) {
        return res.status(404).json({
          error: "Prioridad no encontrada"
        });
      }

      return res.status(200).json({
        message: "Prioridad eliminada exitosamente"
      });

    } catch (error) {
      if (error instanceof Error) {
        // Errores de negocio
        if (error.message.includes("no encontrada") ||
            error.message.includes("en uso")) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }
}