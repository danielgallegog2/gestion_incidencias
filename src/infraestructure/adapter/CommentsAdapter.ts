// infrastructure/adapter/CommentsAdapter.ts
import { Repository } from 'typeorm';
import { Comments, Comments as CommentsDomain } from '../../domain/Comments';
import { CommentsPort } from '../../domain/CommentsPort';
import { Comments as CommentsEntity } from '../entities/Comments';
import { AppDataSource } from '../config/data-base';

/**
 * Adaptador que implementa la persistencia de comentarios usando TypeORM
 * Implementa el patrón Adapter de la arquitectura hexagonal
 * 
 * Responsabilidades:
 * - Traducir entre objetos de dominio y entidades de base de datos
 * - Implementar todas las operaciones definidas en CommentsPort
 * - Manejar la persistencia específica de la base de datos
 * - Gestionar errores de infraestructura
 */
export class CommentsAdapter implements CommentsPort {
  private commentsRepository: Repository<CommentsEntity>;

  /**
   * Constructor que inicializa el repositorio de TypeORM
   * Obtiene la instancia del repositorio desde la fuente de datos configurada
   */
  constructor() {
    this.commentsRepository = AppDataSource.getRepository(CommentsEntity);
  }

  /**
   * Convierte una entidad de base de datos a objeto de dominio
   * @param entity - Entidad de base de datos
   * @returns CommentsDomain - Objeto de dominio
   */
  private toDomain(entity: CommentsEntity): CommentsDomain {
    return {
      id: entity.id_comentarios,
      incidencia: entity.incidencia_id,
      usuario: entity.usuario_id,
      comentario: entity.comentario,
      fechaCreacion: entity.creado_en,
    };
  }

  /**
   * Convierte un objeto de dominio a entidad de base de datos
   * @param comments - Objeto de dominio sin ID y fecha de creación
   * @returns CommentsEntity - Entidad de base de datos
   */
  private toEntity(comments: Omit<CommentsDomain, 'id' | 'fechaCreacion'>): CommentsEntity {
    const commentEntity = new CommentsEntity();
    commentEntity.incidencia_id = comments.incidencia;
    commentEntity.usuario_id = comments.usuario;
    commentEntity.comentario = comments.comentario;
    return commentEntity;
  }

  /**
   * Crea un nuevo comentario en la base de datos
   * @param comments - Datos del comentario a crear
   * @returns Promise<number> - ID del comentario creado
   * @throws Error si falla la operación de creación
   */
  async createComments(comments: Omit<CommentsDomain, 'id' | 'fechaCreacion'>): Promise<number> {
    try {
      const newComments = this.toEntity(comments);
      const savedComments = await this.commentsRepository.save(newComments);
      return savedComments.id_comentarios;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Error al crear el comentario en la base de datos');
    }
  }

  /**
   * Obtiene un comentario por su ID
   * @param id - Identificador del comentario
   * @returns Promise<CommentsDomain | null> - Comentario encontrado o null
   * @throws Error si falla la consulta
   */
  async getCommentsById(id: number): Promise<CommentsDomain | null> {
    try {
      const comment = await this.commentsRepository.findOne({
        where: { id_comentarios: id }
      });
      return comment ? this.toDomain(comment) : null;
    } catch (error) {
      console.error('Error fetching comment by ID:', error);
      throw new Error('Error al obtener el comentario por ID');
    }
  }

  /**
   * Actualiza un comentario existente
   * @param id - Identificador del comentario
   * @param comments - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si falla la actualización
   */
  async updateComments(id: number, comments: Partial<Comments>): Promise<boolean> {
    try {
      const existingComments = await this.commentsRepository.findOne({
        where: { id_comentarios: id }
      });

      if (!existingComments) {
        return false;
      }

      // Actualizar solo los campos proporcionados
      if (comments.incidencia !== undefined) {
        existingComments.incidencia_id = comments.incidencia;
      }
      if (comments.usuario !== undefined) {
        existingComments.usuario_id = comments.usuario;
      }
      if (comments.comentario !== undefined) {
        existingComments.comentario = comments.comentario;
      }

      await this.commentsRepository.save(existingComments);
      return true;

    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Error al actualizar el comentario');
    }
  }

  /**
   * Obtiene todos los comentarios del sistema
   * @returns Promise<CommentsDomain[]> - Array de todos los comentarios
   * @throws Error si falla la consulta
   */
  async getAllComments(): Promise<CommentsDomain[]> {
    try {
      const comments = await this.commentsRepository.find({
        order: { creado_en: 'DESC' }
      });
      return comments.map(comment => this.toDomain(comment));
    } catch (error) {
      console.error('Error fetching all comments:', error);
      throw new Error('Error al obtener todos los comentarios');
    }
  }

  /**
   * Obtiene comentarios por ID de incidencia
   * @param incidenciaId - ID de la incidencia
   * @returns Promise<CommentsDomain[]> - Array de comentarios de la incidencia
   * @throws Error si falla la consulta
   */
  async getCommentsByIncidencia(incidenciaId: number): Promise<CommentsDomain[]> {
    try {
      const comments = await this.commentsRepository.find({
        where: { incidencia_id: incidenciaId },
        order: { creado_en: 'ASC' }
      });
      return comments.map(comment => this.toDomain(comment));
    } catch (error) {
      console.error('Error fetching comments by incidencia:', error);
      throw new Error('Error al obtener los comentarios de la incidencia');
    }
  }

  /**
   * Elimina un comentario de la base de datos
   * @param id - ID del comentario a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si falla la eliminación
   */
  async deleteComments(id: number): Promise<boolean> {
    try {
      const result = await this.commentsRepository.delete({ id_comentarios: id });
      return (result.affected ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Error al eliminar el comentario');
    }
  }
}