// infrastructure/adapter/PriorityAdapter.ts
import { Repository } from 'typeorm';
import { Priority as PriorityDomain } from '../../domain/Priority';
import { PriorityPort } from '../../domain/PriorityPort';
import { Priority as PriorityEntity } from '../entities/Priority';
import { AppDataSource } from '../config/data-base';

/**
 * Adaptador que implementa la persistencia de prioridades usando TypeORM
 * Implementa el patrón Adapter de la arquitectura hexagonal
 * 
 * Responsabilidades:
 * - Traducir entre objetos de dominio y entidades de base de datos
 * - Implementar todas las operaciones definidas en PriorityPort
 * - Manejar la persistencia específica de MySQL
 * - Gestionar errores de infraestructura
 */
export class PriorityAdapter implements PriorityPort {
  private priorityRepository: Repository<PriorityEntity>;

  /**
   * Constructor que inicializa el repositorio de TypeORM
   * Obtiene la instancia del repositorio desde la fuente de datos configurada
   */
  constructor() {
    this.priorityRepository = AppDataSource.getRepository(PriorityEntity);
  }

  /**
   * Convierte una entidad de base de datos a objeto de dominio
   * @param entity - Entidad de base de datos
   * @returns PriorityDomain - Objeto de dominio
   */
  private toDomain(entity: PriorityEntity): PriorityDomain {
    return {
      id: entity.id_prioridad,
      nombre: entity.nombre_prioridad,
      descripcion: entity.descripcion_prioridad,
      nivel: entity.nivel_prioridad,
      color: entity.color_prioridad,
      estado: entity.estado_prioridad,
      fechaCreacion: entity.fecha_creacion,
    };
  }

  /**
   * Convierte un objeto de dominio a entidad de base de datos
   * @param priority - Objeto de dominio sin ID y fecha de creación
   * @returns PriorityEntity - Entidad de base de datos
   */
  private toEntity(priority: Omit<PriorityDomain, 'id' | 'fechaCreacion'>): PriorityEntity {
    const priorityEntity = new PriorityEntity();
    priorityEntity.nombre_prioridad = priority.nombre;
    priorityEntity.descripcion_prioridad = priority.descripcion;
    priorityEntity.nivel_prioridad = priority.nivel;
    priorityEntity.color_prioridad = priority.color;
    priorityEntity.estado_prioridad = priority.estado || 1;
    return priorityEntity;
  }

  /**
   * Crea una nueva prioridad en la base de datos
   * @param priority - Datos de la prioridad a crear
   * @returns Promise<number> - ID de la prioridad creada
   * @throws Error si falla la operación de creación
   */
  async createPriority(priority: Omit<PriorityDomain, 'id' | 'fechaCreacion'>): Promise<number> {
    try {
      const newPriority = this.toEntity(priority);
      const savedPriority = await this.priorityRepository.save(newPriority);
      return savedPriority.id_prioridad;
    } catch (error) {
      console.error('Error creating priority:', error);
      throw new Error('Error al crear la prioridad en la base de datos');
    }
  }

  /**
   * Obtiene una prioridad por su ID
   * @param id - Identificador de la prioridad
   * @returns Promise<PriorityDomain | null> - Prioridad encontrada o null
   * @throws Error si falla la consulta
   */
  async getPriorityById(id: number): Promise<PriorityDomain | null> {
    try {
      const priority = await this.priorityRepository.findOne({
        where: { id_prioridad: id }
      });
      return priority ? this.toDomain(priority) : null;
    } catch (error) {
      console.error('Error fetching priority by ID:', error);
      throw new Error('Error al obtener la prioridad por ID');
    }
  }

  /**
   * Obtiene una prioridad por su nombre
   * @param nombre - Nombre de la prioridad
   * @returns Promise<PriorityDomain | null> - Prioridad encontrada o null
   * @throws Error si falla la consulta
   */
  async getPriorityByName(nombre: string): Promise<PriorityDomain | null> {
    try {
      const priority = await this.priorityRepository.findOne({
        where: { nombre_prioridad: nombre }
      });
      return priority ? this.toDomain(priority) : null;
    } catch (error) {
      console.error('Error fetching priority by name:', error);
      throw new Error('Error al obtener la prioridad por nombre');
    }
  }

  /**
   * Obtiene una prioridad por su nivel
   * @param nivel - Nivel numérico de la prioridad
   * @returns Promise<PriorityDomain | null> - Prioridad encontrada o null
   * @throws Error si falla la consulta
   */
  async getPriorityByLevel(nivel: number): Promise<PriorityDomain | null> {
    try {
      const priority = await this.priorityRepository.findOne({
        where: { nivel_prioridad: nivel }
      });
      return priority ? this.toDomain(priority) : null;
    } catch (error) {
      console.error('Error fetching priority by level:', error);
      throw new Error('Error al obtener la prioridad por nivel');
    }
  }

  /**
   * Actualiza una prioridad existente
   * @param id - Identificador de la prioridad
   * @param priority - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si falla la actualización
   */
  async updatePriority(id: number, priority: Partial<PriorityDomain>): Promise<boolean> {
    try {
      const existingPriority = await this.priorityRepository.findOne({
        where: { id_prioridad: id }
      });

      if (!existingPriority) {
        return false;
      }

      // Actualizar solo los campos proporcionados
      Object.assign(existingPriority, {
        nombre_prioridad: priority.nombre ?? existingPriority.nombre_prioridad,
        descripcion_prioridad: priority.descripcion ?? existingPriority.descripcion_prioridad,
        nivel_prioridad: priority.nivel ?? existingPriority.nivel_prioridad,
        color_prioridad: priority.color ?? existingPriority.color_prioridad,
        estado_prioridad: priority.estado ?? existingPriority.estado_prioridad,
      });

      await this.priorityRepository.save(existingPriority);
      return true;
    } catch (error) {
      console.error('Error updating priority:', error);
      throw new Error('Error al actualizar la prioridad');
    }
  }

  /**
   * Elimina una prioridad (eliminación lógica)
   * Cambia el estado a 0 en lugar de eliminar físicamente
   * @param id - Identificador de la prioridad
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si falla la eliminación
   */
  async deletePriority(id: number): Promise<boolean> {
    try {
      const existingPriority = await this.priorityRepository.findOne({
        where: { id_prioridad: id }
      });

      if (!existingPriority) {
        return false;
      }

      // Eliminación lógica: cambiar estado a 0
      existingPriority.estado_prioridad = 0;
      await this.priorityRepository.save(existingPriority);
      return true;
    } catch (error) {
      console.error('Error deleting priority:', error);
      throw new Error('Error al eliminar la prioridad');
    }
  }

  /**
   * Obtiene todas las prioridades activas ordenadas por nivel
   * @returns Promise<PriorityDomain[]> - Array de prioridades activas ordenadas
   * @throws Error si falla la consulta
   */
  async getAllActivePriorities(): Promise<PriorityDomain[]> {
    try {
      const priorities = await this.priorityRepository.find({
        where: { estado_prioridad: 1 },
        order: { nivel_prioridad: 'ASC' }
      });
      return priorities.map(priority => this.toDomain(priority));
    } catch (error) {
      console.error('Error fetching active priorities:', error);
      throw new Error('Error al obtener las prioridades activas');
    }
  }

  /**
   * Obtiene todas las prioridades del sistema ordenadas por nivel
   * @returns Promise<PriorityDomain[]> - Array de todas las prioridades
   * @throws Error si falla la consulta
   */
  async getAllPriorities(): Promise<PriorityDomain[]> {
    try {
      const priorities = await this.priorityRepository.find({
        order: { nivel_prioridad: 'ASC' }
      });
      return priorities.map(priority => this.toDomain(priority));
    } catch (error) {
      console.error('Error fetching all priorities:', error);
      throw new Error('Error al obtener todas las prioridades');
    }
  }
}