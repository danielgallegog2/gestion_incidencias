// infrastructure/adapter/CategoryAdapter.ts
import { Repository } from 'typeorm';
import { Comments, Comments as CommentsDomain } from '../../domain/comments';
import { CommentsPort } from '../../domain/CommentsPort';
import { Comments as CommentsEntity } from '../entities/Comments';
import { AppDataSource } from '../config/data-base';

/**
 * Adaptador que implementa la persistencia de categorías usando TypeORM
 * Implementa el patrón Adapter de la arquitectura hexagonal
 * 
 * Responsabilidades:
 * - Traducir entre objetos de dominio y entidades de base de datos
 * - Implementar todas las operaciones definidas en CategoryPort
 * - Manejar la persistencia específica de MySQL
 * - Gestionar errores de infraestructura
 */
export class CommentsAdapter implements CommentsPort {
  private CommentsRepository: Repository<CommentsEntity>;

  /**
   * Constructor que inicializa el repositorio de TypeORM
   * Obtiene la instancia del repositorio desde la fuente de datos configurada
   */
  constructor() {
    this.CommentsRepository = AppDataSource.getRepository(CommentsEntity);
  }

  /**
   * Convierte una entidad de base de datos a objeto de dominio
   * @param entity - Entidad de base de datos
   * @returns CategoryDomain - Objeto de dominio
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
   * @param category - Objeto de dominio sin ID y fecha de creación
   * @returns CategoryEntity - Entidad de base de datos
   */
  private toEntity(comments: Omit<CommentsDomain, 'id' | 'fechaCreacion'>): CommentsEntity {
    const commentEntity = new CommentsEntity();
    commentEntity.incidencia_id = comments.incidencia;
    commentEntity.usuario_id = comments.usuario;
    commentEntity.comentario = comments.comentario;
    return commentEntity;
  }

  /**
   * Crea una nueva categoría en la base de datos
   * @param category - Datos de la categoría a crear
   * @returns Promise<number> - ID de la categoría creada
   * @throws Error si falla la operación de creación
   */
  async createComments(comments: Omit<CommentsDomain, 'id' | 'fechaCreacion'>): Promise<number> {
    try {
      const newComments = this.toEntity(comments);
      const savedComments = await this.CommentsRepository.save(newComments);
      return savedComments.id_comentarios;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Error al crear el comentario en la base de datos');
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - Identificador de la categoría
   * @returns Promise<CategoryDomain | null> - Categoría encontrada o null
   * @throws Error si falla la consulta
   */
  async getCommentsById(id: number): Promise<CommentsDomain | null> {
    try {
      const comment = await this.CommentsRepository.findOne({
        where: { id_comentarios: id }
      });
      return comment ? this.toDomain(comment) : null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw new Error('Error al obtener el comentario por ID');
    }
  }

  /**
   * Obtiene una categoría por su nombre
   * @param nombre - Nombre de la categoría
   * @returns Promise<CategoryDomain | null> - Categoría encontrada o null
   * @throws Error si falla la consulta
   */
  async updateComments(id: number , comments: Comments): Promise<boolean> {
    try {
       const existingComments = await this.CommentsRepository.findOne({
        where: { id_comentarios: id }
      });

      if (!existingComments) {
        return false;
      }      

      // Actualizar solo los campos proporcionados
      Object.assign(existingComments, {
        incidencia: comments.incidencia ?? existingComments.incidencia_id,
        usuario: comments.usuario ?? existingComments.usuario_id,
        comentario: comments.comentario ?? existingComments.comentario,
      });

      await this.CommentsRepository.save(existingComments);
      return true;

    } catch (error) {
      console.error('Error fetching category by name:', error);
      throw new Error('Error al obtener la categoría por nombre');
    }
  }

  /**
   * Actualiza una categoría existente
   * @param id - Identificador de la categoría
   * @param category - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si falla la actualización
  async getAllComments(id: number, category: Partial<CategoryDomain>): Promise<boolean> {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { id_categorias: id }
      });

      if (!existingCategory) {
        return false;
      }

      // Actualizar solo los campos proporcionados
      Object.assign(existingCategory, {
        nombre: category.nombre ?? existingCategory.nombre,
        descripcion: category.descripcion ?? existingCategory.descripcion,
        estado: category.estado ?? existingCategory.estado,
      });

      await this.categoryRepository.save(existingCategory);
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Error al actualizar la categoría');
    }
  }
    */
}