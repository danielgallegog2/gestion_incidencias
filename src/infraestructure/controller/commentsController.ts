// controllers/CategoryController.ts
import { CommentsApplicationService } from "../../application/CommentsApplicationService";
import { Comments } from '../../domain/comments';
import { Request, Response } from "express";

/**
 * Controlador para manejar las peticiones HTTP relacionadas con categorías
 * Actúa como capa de presentación en la arquitectura hexagonal
 * 
 * Responsabilidades:
 * - Recibir y validar peticiones HTTP
 * - Transformar datos de entrada y salida
 * - Manejar errores y códigos de respuesta HTTP
 * - Delegar la lógica de negocio al servicio de aplicación
 */
export class CommentsController {
  private app: CommentsApplicationService;

  /**
   * Constructor que recibe el servicio de aplicación de categorías
   * Implementa el patrón de inyección de dependencias
   * @param app - Servicio de aplicación de categorías
   */
  constructor(app: CommentsApplicationService) {
    this.app = app;
  }

  /**
   * Crea una nueva categoría
   * Endpoint: POST /categories
   * @param req - Request con los datos de la categoría en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async createComments(req: Request, res: Response): Promise<Response> {
    const { comentario, incidencia, usuario } = req.body;
    
    try {
      // Validaciones básicas de entrada
      if (!comentario || comentario.trim().length === 0) {
        return res.status(400).json({ 
          error: "El comentario es obligatorio" 
        });
      }

      // Validaciones básicas de entrada
      if (isNaN(incidencia) || incidencia <= 0 ||  isNaN(usuario) || usuario <= 0) {
        return res.status(400).json({ 
          error: "Todos los campos son obligatorios" 
        });
      }

      // Delegar al servicio de aplicación
      const commentsId = await this.app.createComments({
        comentario,
        incidencia,
        usuario
      });

      return res.status(201).json({
        message: "Comentario creado correctamente",
        commentsId,
        comments: {
          comentario,
          incidencia,
          usuario
        }
      });

    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        // Errores de negocio (duplicados, validaciones, etc.)
        if (error.message.includes("ya existe") || 
            error.message.includes("obligatorio") ||
            error.message.includes("válido")) {
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
   * Obtiene una categoría por su ID
   * Endpoint: GET /categories/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la categoría encontrada
   */
  async getCommentsById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
          error: "El ID debe ser un número positivo válido" 
        });
      }

      // Delegar al servicio de aplicación
      const category = await this.app.getCommentsById(id);
      
      if (!category) {
        return res.status(404).json({ 
          error: "Categoría no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category
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
   * Obtiene una categoría por su nombre
   * Endpoint: GET /categories/by-name/:nombre
   * @param req - Request con el nombre en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la categoría encontrada
   */
  async updateComments(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre } = req.params;
      
      // Validación del parámetro nombre
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ 
          error: "El nombre de la categoría no puede estar vacío" 
        });
      }

      const id = 1;
      const comments = req.body as Partial<Comments>;


      // Delegar al servicio de aplicación
      const category = await this.app.updateComments(id,comments );
      
      if (!category) {
        return res.status(404).json({ 
          error: "Categoría no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category
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
   * Obtiene todas las categorías activas
   * Endpoint: GET /categories/active
   * @param req - Request object
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las categorías activas
   */
  async getAllComments(req: Request, res: Response): Promise<Response> {
    try {
      // Delegar al servicio de aplicación


      //const categories = await this.app.getAllComments();

      return res.status(200).json({
        message: "Categorías activas obtenidas correctamente",
        // categories: [] // Aquí deberías devolver las categorías obtenidas
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las categorías activas",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error al obtener las categorías activas",
        details: "Error inesperado"
      });
    }
  }
}