// application/CategoryApplicationService.ts
import { Category } from "../domain/Category";
import { CategoryPort } from "../domain/CategoryPort";

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
export class CategoryApplicationService {
  private port: CategoryPort;

  /**
   * Constructor que recibe el puerto de categorías
   * Implementa el patrón de inversión de dependencias
   * @param port - Implementación del puerto de categorías
   */
  constructor(port: CategoryPort) {
    this.port = port;
  }

  /**
   * Crea una nueva categoría aplicando validaciones de negocio
   * @param category - Datos de la categoría a crear
   * @returns Promise<number> - ID de la categoría creada
   * @throws Error si la categoría ya existe o no cumple las validaciones
   */
  async createCategory(category: Omit<Category, "id" | "fechaCreacion">): Promise<number> {
    // Validación de datos de entrada
    this.validateCategoryData(category);

    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await this.port.getCategoryByName(category.nombre);
    if (existingCategory) {
      throw new Error("Ya existe una categoría con este nombre");
    }

    // Aplicar reglas de negocio
    const categoryToCreate = {
      ...category,
      nombre: category.nombre.trim(),
      descripcion: category.descripcion?.trim(),
      estado: category.estado || 1 // Por defecto activa
    };

    return await this.port.createCategory(categoryToCreate);
  }

  /**
   * Obtiene una categoría por su ID
   * @param id - Identificador de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null
   * @throws Error si el ID no es válido
   */
  async getCategoryById(id: number): Promise<Category | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    return await this.port.getCategoryById(id);
  }

  /**
   * Obtiene una categoría por su nombre
   * @param nombre - Nombre de la categoría
   * @returns Promise<Category | null> - Categoría encontrada o null
   * @throws Error si el nombre no es válido
   */
  async getCategoryByName(nombre: string): Promise<Category | null> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre de la categoría no puede estar vacío");
    }

    return await this.port.getCategoryByName(nombre.trim());
  }

  /**
   * Obtiene todas las categorías activas del sistema
   * @returns Promise<Category[]> - Array de categorías activas
   */
  async getAllActiveCategories(): Promise<Category[]> {
    return await this.port.getAllActiveCategories();
  }

  /**
   * Obtiene todas las categorías del sistema
   * @returns Promise<Category[]> - Array de todas las categorías
   */
  async getAllCategories(): Promise<Category[]> {
    return await this.port.getAllCategories();
  }

  /**
   * Actualiza una categoría existente
   * @param id - Identificador de la categoría
   * @param category - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si la categoría no existe o los datos no son válidos
   */
  async updateCategory(id: number, category: Partial<Category>): Promise<boolean> {
    // Validar que la categoría existe
    const existingCategory = await this.port.getCategoryById(id);
    if (!existingCategory) {
      throw new Error("Categoría no encontrada");
    }

    // Validar datos de actualización
    if (category.nombre) {
      this.validateCategoryName(category.nombre);
      
      // Verificar que no exista otra categoría con el mismo nombre
      const categoryWithSameName = await this.port.getCategoryByName(category.nombre);
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new Error("Ya existe otra categoría con este nombre");
      }
    }

    // Preparar datos para actualización
    const categoryToUpdate: Partial<Category> = {};
    
    if (category.nombre) categoryToUpdate.nombre = category.nombre.trim();
    if (category.descripcion !== undefined) categoryToUpdate.descripcion = category.descripcion?.trim();
    if (category.estado !== undefined) categoryToUpdate.estado = category.estado;

    return await this.port.updateCategory(id, categoryToUpdate);
  }

  /**
   * Elimina una categoría (eliminación lógica)
   * @param id - Identificador de la categoría
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si la categoría no existe
   */
  async deleteCategory(id: number): Promise<boolean> {
    const existingCategory = await this.port.getCategoryById(id);
    if (!existingCategory) {
      throw new Error("Categoría no encontrada");
    }

    // Nota: Aquí se podría agregar validación para verificar si la categoría
    // está siendo usada en incidencias activas antes de eliminarla
    
    return await this.port.deleteCategory(id);
  }

  /**
   * Valida los datos básicos de una categoría
   * @param category - Datos de la categoría a validar
   * @throws Error si los datos no son válidos
   */
  private validateCategoryData(category: Omit<Category, "id" | "fechaCreacion">): void {
    if (!category.nombre || category.nombre.trim().length === 0) {
      throw new Error("El nombre de la categoría es obligatorio");
    }

    this.validateCategoryName(category.nombre);

    if (category.descripcion && category.descripcion.length > 1000) {
      throw new Error("La descripción no puede exceder los 1000 caracteres");
    }

    if (category.estado !== undefined && ![0, 1].includes(category.estado)) {
      throw new Error("El estado debe ser 0 (inactiva) o 1 (activa)");
    }
  }

  /**
   * Valida el formato del nombre de la categoría
   * @param nombre - Nombre a validar
   * @throws Error si el nombre no cumple con los criterios
   */
  private validateCategoryName(nombre: string): void {
    if (nombre.length < 3) {
      throw new Error("El nombre de la categoría debe tener al menos 3 caracteres");
    }

    if (nombre.length > 100) {
      throw new Error("El nombre de la categoría no puede exceder los 100 caracteres");
    }

    // Validar que contenga solo letras, números, espacios y algunos caracteres especiales
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/;
    if (!nameRegex.test(nombre)) {
      throw new Error("El nombre de la categoría solo puede contener letras, números, espacios, guiones y guiones bajos");
    }
  }
}