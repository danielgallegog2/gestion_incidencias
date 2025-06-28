import { Comments } from "../domain/Comments";
import { CommentsPort } from "../domain/CommentsPort";

/**
 * Servicio de aplicación para la gestión de comentarios
 * Implementa la lógica de negocio y casos de uso relacionados con comentarios
 *
 * Responsabilidades:
 * - Validación de reglas de negocio
 * - Coordinación entre el dominio y la infraestructura
 * - Manejo de excepciones y errores de negocio
 * - Aplicación de políticas empresariales
 */
export class CommentsApplicationService {
  private port: CommentsPort;

  constructor(port: CommentsPort) {
    this.port = port;
  }

  async createComments(
    comments: Omit<Comments, "id" | "fechaCreacion">
  ): Promise<number> {
    if (!comments.comentario || comments.comentario.trim().length === 0) {
      throw new Error("El comentario es obligatorio");
    }

    if (!comments.incidencia || comments.incidencia <= 0) {
      throw new Error("El ID de incidencia debe ser un número positivo");
    }

    if (!comments.usuario || comments.usuario <= 0) {
      throw new Error("El ID de usuario debe ser un número positivo");
    }

    // Validar longitud del comentario
    if (comments.comentario.length > 1000) {
      throw new Error("El comentario no puede exceder 1000 caracteres");
    }

    return await this.port.createComments(comments);
  }

  async getCommentsById(id: number): Promise<Comments | null> {
    if (!id || id <= 0) {
      throw new Error("El ID del comentario debe ser un número positivo");
    }

    return await this.port.getCommentsById(id);
  }

  async updateComments(
    id: number,
    comments: Partial<Comments>
  ): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("El ID del comentario debe ser un número positivo");
    }

    // Validaciones para los campos que se van a actualizar
    if (comments.comentario !== undefined) {
      if (!comments.comentario || comments.comentario.trim().length === 0) {
        throw new Error("El comentario no puede estar vacío");
      }
      if (comments.comentario.length > 1000) {
        throw new Error("El comentario no puede exceder 1000 caracteres");
      }
    }

    if (comments.incidencia !== undefined && comments.incidencia <= 0) {
      throw new Error("El ID de incidencia debe ser un número positivo");
    }

    if (comments.usuario !== undefined && comments.usuario <= 0) {
      throw new Error("El ID de usuario debe ser un número positivo");
    }

    return await this.port.updateComments(id, comments);
  }

  async getAllComments(): Promise<Comments[]> {
    return await this.port.getAllComments();
  }

  async getCommentsByIncidencia(incidenciaId: number): Promise<Comments[]> {
    if (!incidenciaId || incidenciaId <= 0) {
      throw new Error("El ID de incidencia debe ser un número positivo");
    }

    return await this.port.getCommentsByIncidencia(incidenciaId);
  }

  async deleteComments(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("El ID del comentario debe ser un número positivo");
    }

    return await this.port.deleteComments(id);
  }
}
