// application/CategoryApplicationService.ts
import { Comments } from "../domain/comments";
import { CommentsPort } from "../domain/CommentsPort";

/**
 * Servicio de aplicación para la gestión de categorías
 * Implementa la lógica de negocio y casos de uso relacionados con categorías
 * 
 * Responsabilidades:
 * - Validación de reglas de negocio
 * - Coordinación entre el dominio y la infraestructura
 * - Manejo de excepciones y errores de negocio
 * - Aplicación de políticas empresariales
 */
export class CommentsApplicationService {
  private port: CommentsPort;

  /**
   * Constructor que recibe el puerto de categorías
   * Implementa el patrón de inversión de dependencias
   * @param port - Implementación del puerto de categorías
   */
  constructor(port: CommentsPort) {
    this.port = port;
  }

  /**
   * Crea una nueva categoría aplicando validaciones de negocio
   * @param category - Datos de la categoría a crear
   * @returns Promise<number> - ID de la categoría creada
   * @throws Error si la categoría ya existe o no cumple las validaciones
   */
  async createComments(comments: Omit<Comments, "id" | "fechaCreacion">): Promise<number> {
    return await this.port.createComments(comments);
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - Identificador de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null
   * @throws Error si el ID no es válido
   */
  async getCommentsById(id: number): Promise<Comments | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    return await this.port.getCommentsById(id);
  }

  /**
   * Obtiene una categoría por su nombre
   * @param nombre - Nombre de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null
   * @throws Error si el nombre no es válido
   */
  async updateComments(id: number, comments: Partial<Comments>): Promise<boolean> {   
    return await this.port.updateComments(id , comments);
  }

  /**
   * Obtiene todas las categorías activas del sistema
   * @returns Promise<Category[]> - Array de categorías activas
   */
  /*
  async getAllComments(): Promise<Comments[]> {
    return await this.port.getAllComments();
  }
    */
}