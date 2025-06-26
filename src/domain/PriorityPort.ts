// domain/PriorityPort.ts
import { Priority } from "./Priority";

/**
 * Puerto (interface) que define las operaciones disponibles para las prioridades
 * Implementa el patrón Port en la arquitectura hexagonal
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que quiera implementar la persistencia de prioridades
 * 
 * Principios aplicados:
 * - Inversión de dependencias: El dominio define la interfaz
 * - Separación de responsabilidades: Solo operaciones de persistencia
 * - Abstracción: No depende de implementación específica
 */
export interface PriorityPort {
  /**
   * Crea una nueva prioridad en el sistema
   * @param priority - Datos de la prioridad sin el ID (se genera automáticamente)
   * @returns Promise<number> - ID de la prioridad creada
   * @throws Error si la prioridad ya existe o hay problemas de validación
   */
  createPriority(priority: Omit<Priority, "id" | "fechaCreacion">): Promise<number>;

  /**
   * Obtiene una prioridad específica por su ID
   * @param id - Identificador único de la prioridad
   * @returns Promise<Priority | null> - Prioridad encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getPriorityById(id: number): Promise<Priority | null>;

  /**
   * Obtiene una prioridad específica por su nombre
   * @param nombre - Nombre único de la prioridad
   * @returns Promise<Priority | null> - Prioridad encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getPriorityByName(nombre: string): Promise<Priority | null>;

  /**
   * Obtiene una prioridad específica por su nivel
   * @param nivel - Nivel numérico de la prioridad
   * @returns Promise<Priority | null> - Prioridad encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getPriorityByLevel(nivel: number): Promise<Priority | null>;

  /**
   * Actualiza los datos de una prioridad existente
   * @param id - Identificador de la prioridad a actualizar
   * @param priority - Datos parciales de la prioridad a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente, false si no existe
   * @throws Error si hay problemas de validación o conexión
   */
  updatePriority(id: number, priority: Partial<Priority>): Promise<boolean>;

  /**
   * Elimina una prioridad del sistema (eliminación lógica)
   * Cambia el estado a 0 (inactiva) en lugar de eliminar físicamente
   * @param id - Identificador de la prioridad a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente, false si no existe
   * @throws Error si hay problemas de conexión o la prioridad está en uso
   */
  deletePriority(id: number): Promise<boolean>;

  /**
   * Obtiene todas las prioridades activas ordenadas por nivel
   * @returns Promise<Priority[]> - Array de prioridades activas ordenadas por nivel ascendente
   * @throws Error si hay problemas de conexión o consulta
   */
  getAllActivePriorities(): Promise<Priority[]>;

  /**
   * Obtiene todas las prioridades del sistema (activas e inactivas)
   * @returns Promise<Priority[]> - Array de todas las prioridades ordenadas por nivel
   * @throws Error si hay problemas de conexión o consulta
   */
  getAllPriorities(): Promise<Priority[]>;
}