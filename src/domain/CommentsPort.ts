import { Comments } from "./Comments";

/**
 * Puerto (interfaz) que define las operaciones disponibles para comentarios
 * Implementa el patrón Port del diseño hexagonal
 * Esta interfaz será implementada por el adaptador de persistencia
 */
export interface CommentsPort {
  createComments(
    comments: Omit<Comments, "id" | "fechaCreacion">
  ): Promise<number>;
  getCommentsById(id: number): Promise<Comments | null>;
  updateComments(id: number, comments: Partial<Comments>): Promise<boolean>;
  getAllComments(): Promise<Comments[]>;
  getCommentsByIncidencia(incidenciaId: number): Promise<Comments[]>;
  deleteComments(id: number): Promise<boolean>;
}
