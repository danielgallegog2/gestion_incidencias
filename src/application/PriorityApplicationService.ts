import { Priority } from "../domain/Priority";
import { PriorityPort } from "../domain/PriorityPort";

/**
 * Servicio de aplicación para la gestión de prioridades
 * Implementa la lógica de negocio y casos de uso relacionados con prioridades
 *
 * Responsabilidades:
 * - Validación de reglas de negocio específicas para prioridades
 * - Coordinación entre el dominio y la infraestructura
 * - Manejo de excepciones y errores de negocio
 * - Aplicación de políticas empresariales para niveles de prioridad
 */
export class PriorityApplicationService {
  private port: PriorityPort;

  constructor(port: PriorityPort) {
    this.port = port;
  }

  async createPriority(
    priority: Omit<Priority, "id" | "fechaCreacion">
  ): Promise<number> {
    this.validatePriorityData(priority);

    // Verificar que no exista una prioridad con el mismo nombre
    const existingPriorityByName = await this.port.getPriorityByName(
      priority.nombre
    );
    if (existingPriorityByName) {
      throw new Error("Ya existe una prioridad con este nombre");
    }

    // Verificar que no exista una prioridad con el mismo nivel
    const existingPriorityByLevel = await this.port.getPriorityByLevel(
      priority.nivel
    );
    if (existingPriorityByLevel) {
      throw new Error("Ya existe una prioridad con este nivel");
    }

    const priorityToCreate = {
      ...priority,
      nombre: priority.nombre.trim(),
      descripcion: priority.descripcion?.trim(),
      estado: priority.estado || 1, // Por defecto activa
      color: this.validateAndFormatColor(priority.color),
    };

    return await this.port.createPriority(priorityToCreate);
  }

  async getPriorityById(id: number): Promise<Priority | null> {
    if (!id || id <= 0) {
      throw new Error("El ID de la prioridad debe ser un número positivo");
    }

    return await this.port.getPriorityById(id);
  }

  async getPriorityByName(nombre: string): Promise<Priority | null> {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error("El nombre de la prioridad no puede estar vacío");
    }

    return await this.port.getPriorityByName(nombre.trim());
  }

  async getPriorityByLevel(nivel: number): Promise<Priority | null> {
    if (!nivel || nivel <= 0) {
      throw new Error("El nivel de la prioridad debe ser un número positivo");
    }

    return await this.port.getPriorityByLevel(nivel);
  }

  async getAllActivePriorities(): Promise<Priority[]> {
    return await this.port.getAllActivePriorities();
  }

  async getAllPriorities(): Promise<Priority[]> {
    return await this.port.getAllPriorities();
  }

  async updatePriority(
    id: number,
    priority: Partial<Priority>
  ): Promise<boolean> {
    // Validar que la prioridad existe
    const existingPriority = await this.port.getPriorityById(id);
    if (!existingPriority) {
      throw new Error("Prioridad no encontrada");
    }

    // Validar datos de actualización
    if (priority.nombre) {
      this.validatePriorityName(priority.nombre);

      // Verificar que no exista otra prioridad con el mismo nombre
      const priorityWithSameName = await this.port.getPriorityByName(
        priority.nombre
      );
      if (priorityWithSameName && priorityWithSameName.id !== id) {
        throw new Error("Ya existe otra prioridad con este nombre");
      }
    }

    if (priority.nivel) {
      this.validatePriorityLevel(priority.nivel);

      // Verificar que no exista otra prioridad con el mismo nivel
      const priorityWithSameLevel = await this.port.getPriorityByLevel(
        priority.nivel
      );
      if (priorityWithSameLevel && priorityWithSameLevel.id !== id) {
        throw new Error("Ya existe otra prioridad con este nivel");
      }
    }

    const priorityToUpdate: Partial<Priority> = {};

    if (priority.nombre) priorityToUpdate.nombre = priority.nombre.trim();
    if (priority.descripcion !== undefined)
      priorityToUpdate.descripcion = priority.descripcion?.trim();
    if (priority.nivel) priorityToUpdate.nivel = priority.nivel;
    if (priority.color !== undefined)
      priorityToUpdate.color = this.validateAndFormatColor(priority.color);
    if (priority.estado !== undefined)
      priorityToUpdate.estado = priority.estado;

    return await this.port.updatePriority(id, priorityToUpdate);
  }

  async deletePriority(id: number): Promise<boolean> {
    const existingPriority = await this.port.getPriorityById(id);
    if (!existingPriority) {
      throw new Error("Prioridad no encontrada");
    }

    return await this.port.deletePriority(id);
  }

  private validatePriorityData(
    priority: Omit<Priority, "id" | "fechaCreacion">
  ): void {
    if (!priority.nombre || priority.nombre.trim().length === 0) {
      throw new Error("El nombre de la prioridad es obligatorio");
    }

    this.validatePriorityName(priority.nombre);
    this.validatePriorityLevel(priority.nivel);

    if (priority.descripcion && priority.descripcion.length > 1000) {
      throw new Error("La descripción no puede exceder los 1000 caracteres");
    }

    if (priority.estado !== undefined && ![0, 1].includes(priority.estado)) {
      throw new Error("El estado debe ser 0 (inactiva) o 1 (activa)");
    }
  }

  private validatePriorityName(nombre: string): void {
    if (nombre.length < 2) {
      throw new Error(
        "El nombre de la prioridad debe tener al menos 2 caracteres"
      );
    }

    if (nombre.length > 100) {
      throw new Error(
        "El nombre de la prioridad no puede exceder los 100 caracteres"
      );
    }

    // Validar que contenga solo letras, números, espacios y algunos caracteres especiales
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/;
    if (!nameRegex.test(nombre)) {
      throw new Error(
        "El nombre de la prioridad solo puede contener letras, números, espacios, guiones y guiones bajos"
      );
    }
  }

  private validatePriorityLevel(nivel: number): void {
    if (!Number.isInteger(nivel) || nivel <= 0) {
      throw new Error("El nivel debe ser un número entero positivo");
    }

    if (nivel > 10) {
      throw new Error("El nivel no puede ser mayor a 10");
    }
  }

  private validateAndFormatColor(color?: string): string | undefined {
    if (!color) return undefined;

    // Remover espacios y convertir a minúsculas
    const cleanColor = color.trim().toLowerCase();

    // Validar formato hexadecimal
    const hexRegex = /^#([a-f0-9]{6}|[a-f0-9]{3})$/;
    if (!hexRegex.test(cleanColor)) {
      throw new Error(
        "El color debe estar en formato hexadecimal (#RRGGBB o #RGB)"
      );
    }

    // Convertir formato corto a formato largo si es necesario
    if (cleanColor.length === 4) {
      const shortHex = cleanColor.substring(1);
      return `#${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`;
    }

    return cleanColor;
  }
}
