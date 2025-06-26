// infrastructure/adapter/CategoryAdapter.ts
import { Repository } from 'typeorm';
import { Category as CategoryDomain } from '../../domain/Category';
import { CategoryPort } from '../../domain/CategoryPort';
import { Category as CategoryEntity } from '../entities/Category';
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
export class CategoryAdapter implements CategoryPort {
  private categoryRepository: Repository<CategoryEntity>;

  /**
   * Constructor que inicializa el repositorio de TypeORM
   * Obtiene la instancia del repositorio desde la fuente de datos configurada
   */
  constructor() {
    this.categoryRepository = AppDataSource.getRepository(CategoryEntity);
  }

  /**
   * Convierte una entidad de base de datos a objeto de dominio
   * @param entity - Entidad de base de datos
   * @returns CategoryDomain - Objeto de dominio
   */
  private toDomain(entity: CategoryEntity): CategoryDomain {
    return {
      id: entity.id_categorias,
      nombre: entity.nombre,
      descripcion: entity.descripcion,
      estado: entity.estado,
      fechaCreacion: entity.fecha_creacion,
    };
  }

  /**
   * Convierte un objeto de dominio a entidad de base de datos
   * @param category - Objeto de dominio sin ID y fecha de creación
   * @returns CategoryEntity - Entidad de base de datos
   */
  private toEntity(category: Omit<CategoryDomain, 'id' | 'fechaCreacion'>): CategoryEntity {
    const categoryEntity = new CategoryEntity();
    categoryEntity.nombre = category.nombre;
    categoryEntity.descripcion = category.descripcion;
    categoryEntity.estado = category.estado || 1;
    return categoryEntity;
  }

  /**
   * Crea una nueva categoría en la base de datos
   * @param category - Datos de la categoría a crear
   * @returns Promise<number> - ID de la categoría creada
   * @throws Error si falla la operación de creación
   */
  async createCategory(category: Omit<CategoryDomain, 'id' | 'fechaCreacion'>): Promise<number> {
    try {
      const newCategory = this.toEntity(category);
      const savedCategory = await this.categoryRepository.save(newCategory);
      return savedCategory.id_categorias;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Error al crear la categoría en la base de datos');
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - Identificador de la categoría
   * @returns Promise<CategoryDomain | null> - Categoría encontrada o null
   * @throws Error si falla la consulta
   */
  async getCategoryById(id: number): Promise<CategoryDomain | null> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id_categorias: id }
      });
      return category ? this.toDomain(category) : null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw new Error('Error al obtener la categoría por ID');
    }
  }

  /**
   * Obtiene una categoría por su nombre
   * @param nombre - Nombre de la categoría
   * @returns Promise<CategoryDomain | null> - Categoría encontrada o null
   * @throws Error si falla la consulta
   */
  async getCategoryByName(nombre: string): Promise<CategoryDomain | null> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { nombre: nombre }
      });
      return category ? this.toDomain(category) : null;
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
   */
  async updateCategory(id: number, category: Partial<CategoryDomain>): Promise<boolean> {
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

  /**
   * Elimina una categoría (eliminación lógica)
   * Cambia el estado a 0 en lugar de eliminar físicamente
   * @param id - Identificador de la categoría
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si falla la eliminación
   */
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const existingCategory = await this.categoryRepository.findOne({
        where: { id_categorias: id }
      });

      if (!existingCategory) {
        return false;
      }

      // Eliminación lógica: cambiar estado a 0
      existingCategory.estado = 0;
      await this.categoryRepository.save(existingCategory);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Error al eliminar la categoría');
    }
  }

  /**
   * Obtiene todas las categorías activas
   * @returns Promise<CategoryDomain[]> - Array de categorías activas
   * @throws Error si falla la consulta
   */
  async getAllActiveCategories(): Promise<CategoryDomain[]> {
    try {
      const categories = await this.categoryRepository.find({
        where: { estado: 1 },
        order: { nombre: 'ASC' }
      });
      return categories.map(category => this.toDomain(category));
    } catch (error) {
      console.error('Error fetching active categories:', error);
      throw new Error('Error al obtener las categorías activas');
    }
  }

  /**
   * Obtiene todas las categorías del sistema
   * @returns Promise<CategoryDomain[]> - Array de todas las categorías
   * @throws Error si falla la consulta
   */
  async getAllCategories(): Promise<CategoryDomain[]> {
    try {
      const categories = await this.categoryRepository.find({
        order: { nombre: 'ASC' }
      });
      return categories.map(category => this.toDomain(category));
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw new Error('Error al obtener todas las categorías');
    }
  }
}