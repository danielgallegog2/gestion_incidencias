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
  createCategory(
    category: Omit<Category, "id" | "fechaCreacion">
  ): Promise<number>;
  getCategoryById(id: number): Promise<Category | null>;
  getCategoryByName(nombre: string): Promise<Category | null>;
  updateCategory(id: number, category: Partial<Category>): Promise<boolean>;
  deleteCategory(id: number): Promise<boolean>;
  getAllActiveCategories(): Promise<Category[]>;
  getAllCategories(): Promise<Category[]>;
}
