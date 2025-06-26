// domain/CategoryPort.ts
import { Category } from "./Category";

/**
 * Puerto (interface) que define las operaciones disponibles para las categorías
 * Implementa el patrón Port en la arquitectura hexagonal
 * Esta interfaz define el contrato que debe cumplir cualquier adaptador
 * que quiera implementar la persistencia de categorías
 * 
 * Principios aplicados:
 * - Inversión de dependencias: El dominio define la interfaz
 * - Separación de responsabilidades: Solo operaciones de persistencia
 * - Abstracción: No depende de implementación específica (MySQL, MongoDB, etc.)
 */
export interface CategoryPort {
  /**
   * Crea una nueva categoría en el sistema
   * @param category - Datos de la categoría sin el ID (se genera automáticamente)
   * @returns Promise<number> - ID de la categoría creada
   * @throws Error si la categoría ya existe o hay problemas de validación
   */
  createCategory(category: Omit<Category, "id" | "fechaCreacion">): Promise<number>;

  /**
   * Obtiene una categoría específica por su ID
   * @param id - Identificador único de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getCategoryById(id: number): Promise<Category | null>;

  /**
   * Obtiene una categoría específica por su nombre
   * @param nombre - Nombre único de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null si no existe
   * @throws Error si hay problemas de conexión o consulta
   */
  getCategoryByName(nombre: string): Promise<Category | null>;

  /**
   * Actualiza los datos de una categoría existente
   * @param id - Identificador de la categoría a actualizar
   * @param category - Datos parciales de la categoría a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente, false si no existe
   * @throws Error si hay problemas de validación o conexión
   */
  updateCategory(id: number, category: Partial<Category>): Promise<boolean>;

  /**
   * Elimina una categoría del sistema (eliminación lógica)
   * Cambia el estado a 0 (inactiva) en lugar de eliminar físicamente
   * @param id - Identificador de la categoría a eliminar
   * @returns Promise<boolean> - true si se eliminó correctamente, false si no existe
   * @throws Error si hay problemas de conexión o la categoría está en uso
   */
  deleteCategory(id: number): Promise<boolean>;

  /**
   * Obtiene todas las categorías activas del sistema
   * @returns Promise<Category[]> - Array de todas las categorías activas
   * @throws Error si hay problemas de conexión o consulta
   */
  getAllActiveCategories(): Promise<Category[]>;

  /**
   * Obtiene todas las categorías del sistema (activas e inactivas)
   * @returns Promise<Category[]> - Array de todas las categorías
   * @throws Error si hay problemas de conexión o consulta
   */
  getAllCategories(): Promise<Category[]>;
}