// application/CommentsApplicationService.ts
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

  /**
   * Constructor que recibe el puerto de comentarios
   * Implementa el patrón de inversión de dependencias
   * @param port - Implementación del puerto de comentarios
   */
  constructor(port: CommentsPort) {
    this.port = port;
  }

  /**
   * Crea un nuevo comentario aplicando validaciones de negocio
   * @param comments - Datos del comentario a crear
   * @returns Promise<number> - ID del comentario creado
   * @throws Error si el comentario no cumple las validaciones
   */
  async createComments(comments: Omit<Comments, "id" | "fechaCreacion">): Promise<number> {
    // Validaciones de negocio
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

  /**
   * Obtiene un comentario por su ID
   * @param id - Identificador del comentario
   * @returns Promise<Comments | null> - Comentario encontrado o null
   * @throws Error si el ID no es válido
   */
  async getCommentsById(id: number): Promise<Comments | null> {
    if (!id || id <= 0) {
      throw new Error("El ID del comentario debe ser un número positivo");
    }

    return await this.port.getCommentsById(id);
  }

  /**
   * Actualiza un comentario existente
   * @param id - Identificador del comentario
   * @param comments - Datos parciales del comentario a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si los datos no son válidos
   */
  async updateComments(id: number, comments: Partial<Comments>): Promise<boolean> {
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

  /**
   * Obtiene todos los comentarios del sistema
   * @returns Promise<Comments[]> - Array de comentarios
   */
  async getAllComments(): Promise<Comments[]> {
    return await this.port.getAllComments();
  }

  /**
   * Obtiene comentarios por ID de incidencia
   * @param incidenciaId - ID de la incidencia
   * @returns Promise<Comments[]> - Array de comentarios de la incidencia
   */
  async getCommentsByIncidencia(incidenciaId: number): Promise<Comments[]> {
    if (!incidenciaId || incidenciaId <= 0) {
      throw new Error("El ID de incidencia debe ser un número positivo");
    }

    return await this.port.getCommentsByIncidencia(incidenciaId);
  }

  /**
   * Elimina un comentario (eliminación lógica)
   * @param id - ID del comentario a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente
   */
  async deleteComments(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("El ID del comentario debe ser un número positivo");
    }

    return await this.port.deleteComments(id);
  }
}