// domain/CommentsPort.ts
import { Comments } from "./Comments";

/**
 * Puerto (interfaz) que define las operaciones disponibles para comentarios
 * Implementa el patrón Port del diseño hexagonal
 * Esta interfaz será implementada por el adaptador de persistencia
 */
export interface CommentsPort {
  /**
   * Crea un nuevo comentario
   * @param comments - Datos del comentario sin ID ni fecha de creación
   * @returns Promise<number> - ID del comentario creado
   */
  createComments(comments: Omit<Comments, "id" | "fechaCreacion">): Promise<number>;

  /**
   * Obtiene un comentario por su ID
   * @param id - Identificador del comentario
   * @returns Promise<Comments | null> - Comentario encontrado o null
   */
  getCommentsById(id: number): Promise<Comments | null>;

  /**
   * Actualiza un comentario existente
   * @param id - Identificador del comentario
   * @param comments - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   */
  updateComments(id: number, comments: Partial<Comments>): Promise<boolean>;

  /**
   * Obtiene todos los comentarios del sistema
   * @returns Promise<Comments[]> - Array de todos los comentarios
   */
  getAllComments(): Promise<Comments[]>;

  /**
   * Obtiene comentarios por ID de incidencia
   * @param incidenciaId - ID de la incidencia
   * @returns Promise<Comments[]> - Array de comentarios de la incidencia
   */
  getCommentsByIncidencia(incidenciaId: number): Promise<Comments[]>;

  /**
   * Elimina un comentario (puede ser eliminación física o lógica)
   * @param id - ID del comentario a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente
   */
  deleteComments(id: number): Promise<boolean>;
}