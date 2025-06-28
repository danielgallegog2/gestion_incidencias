import { CommentsApplicationService } from "../../application/CommentsApplicationService";
import { Comments } from "../../domain/Comments";
import { Request, Response } from "express";

/**
 * Controlador para manejar las peticiones HTTP relacionadas con comentarios
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

  constructor(app: CommentsApplicationService) {
    this.app = app;
  }

  async createComments(req: Request, res: Response): Promise<Response> {
    const { comentario, incidencia, usuario } = req.body;

    try {
      // Validaciones básicas de entrada
      if (!comentario || comentario.trim().length === 0) {
        return res.status(400).json({
          error: "El comentario es obligatorio",
        });
      }

      if (
        isNaN(incidencia) ||
        incidencia <= 0 ||
        isNaN(usuario) ||
        usuario <= 0
      ) {
        return res.status(400).json({
          error: "Los IDs de incidencia y usuario deben ser números positivos",
        });
      }

      const commentsId = await this.app.createComments({
        comentario: comentario.trim(),
        incidencia: parseInt(incidencia),
        usuario: parseInt(usuario),
      });

      return res.status(201).json({
        message: "Comentario creado correctamente",
        commentsId,
        comments: {
          comentario: comentario.trim(),
          incidencia: parseInt(incidencia),
          usuario: parseInt(usuario),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("obligatorio") ||
          error.message.includes("positivo") ||
          error.message.includes("exceder")
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

  async getCommentsById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      const comment = await this.app.getCommentsById(id);

      if (!comment) {
        return res.status(404).json({
          error: "Comentario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Comentario encontrado",
        comment,
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

  async updateComments(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      const updateData = req.body as Partial<Comments>;

      // Validar que al menos un campo esté presente para actualizar
      if (
        !updateData.comentario &&
        !updateData.incidencia &&
        !updateData.usuario
      ) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Convertir strings a números si es necesario
      if (updateData.incidencia) {
        updateData.incidencia = parseInt(updateData.incidencia.toString());
      }
      if (updateData.usuario) {
        updateData.usuario = parseInt(updateData.usuario.toString());
      }

      const updated = await this.app.updateComments(id, updateData);

      if (!updated) {
        return res.status(404).json({
          error: "Comentario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Comentario actualizado correctamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("positivo") ||
          error.message.includes("vacío") ||
          error.message.includes("exceder")
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

  async getAllComments(req: Request, res: Response): Promise<Response> {
    try {
      const comments = await this.app.getAllComments();

      return res.status(200).json({
        message: "Comentarios obtenidos correctamente",
        count: comments.length,
        comments,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener los comentarios",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener los comentarios",
        details: "Error inesperado",
      });
    }
  }

  async getCommentsByIncidencia(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const incidenciaId = parseInt(req.params.incidenciaId);

      // Validación del parámetro
      if (isNaN(incidenciaId) || incidenciaId <= 0) {
        return res.status(400).json({
          error: "El ID de incidencia debe ser un número positivo válido",
        });
      }

      const comments = await this.app.getCommentsByIncidencia(incidenciaId);

      return res.status(200).json({
        message: "Comentarios de la incidencia obtenidos correctamente",
        incidenciaId,
        count: comments.length,
        comments,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener los comentarios de la incidencia",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener los comentarios de la incidencia",
        details: "Error inesperado",
      });
    }
  }

  async deleteComments(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      const deleted = await this.app.deleteComments(id);

      if (!deleted) {
        return res.status(404).json({
          error: "Comentario no encontrado",
        });
      }

      return res.status(200).json({
        message: "Comentario eliminado correctamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al eliminar el comentario",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al eliminar el comentario",
        details: "Error inesperado",
      });
    }
  }
}
