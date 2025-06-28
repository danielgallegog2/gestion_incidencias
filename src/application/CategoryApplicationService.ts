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

  constructor(port: CategoryPort) {
    this.port = port;
  }

  async createCategory(category: Omit<Category, "id" | "fechaCreacion">): Promise<number> {
    this.validateCategoryData(category);

    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await this.port.getCategoryByName(category.nombre);
    if (existingCategory) {
      throw new Error("Ya existe una categoría con este nombre");
    }

    const categoryToCreate = {
      ...category,
      nombre: category.nombre.trim(),
      descripcion: category.descripcion?.trim(),
      estado: category.estado || 1 // Por defecto activa
    };

    return await this.port.createCategory(categoryToCreate);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la categoría debe ser un número positivo");
    }

    return await this.port.getCategoryById(id);
  }

  async getCategoryByName(nombre: string): Promise<Category | null> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre de la categoría no puede estar vacío");
    }

    return await this.port.getCategoryByName(nombre.trim());
  }

  async getAllActiveCategories(): Promise<Category[]> {
    return await this.port.getAllActiveCategories();
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.port.getAllCategories();
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<boolean> {

    const existingCategory = await this.port.getCategoryById(id);
    if (!existingCategory) {
      throw new Error("Categoría no encontrada");
    }

    if (category.nombre) {
      this.validateCategoryName(category.nombre);
      
      // Verificar que no exista otra categoría con el mismo nombre
      const categoryWithSameName = await this.port.getCategoryByName(category.nombre);
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new Error("Ya existe otra categoría con este nombre");
      }
    }
    const categoryToUpdate: Partial<Category> = {};
    
    if (category.nombre) categoryToUpdate.nombre = category.nombre.trim();
    if (category.descripcion !== undefined) categoryToUpdate.descripcion = category.descripcion?.trim();
    if (category.estado !== undefined) categoryToUpdate.estado = category.estado;

    return await this.port.updateCategory(id, categoryToUpdate);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const existingCategory = await this.port.getCategoryById(id);
    if (!existingCategory) {
      throw new Error("Categoría no encontrada");
    }
    
    return await this.port.deleteCategory(id);
  }

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