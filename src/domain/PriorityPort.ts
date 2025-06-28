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
  createPriority(
    priority: Omit<Priority, "id" | "fechaCreacion">
  ): Promise<number>;
  getPriorityById(id: number): Promise<Priority | null>;
  getPriorityByName(nombre: string): Promise<Priority | null>;
  getPriorityByLevel(nivel: number): Promise<Priority | null>;
  updatePriority(id: number, priority: Partial<Priority>): Promise<boolean>;
  deletePriority(id: number): Promise<boolean>;
  getAllActivePriorities(): Promise<Priority[]>;
  getAllPriorities(): Promise<Priority[]>;
}
