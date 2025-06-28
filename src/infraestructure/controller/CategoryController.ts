import { CategoryApplicationService } from "../../application/CategoryApplicationService";
import { Category } from "../../domain/Category";
import { Request, Response } from "express";

/**
 * Controlador para manejar las peticiones HTTP relacionadas con categorías
 * Actúa como capa de presentación en la arquitectura hexagonal
 *
 * Responsabilidades:
 * - Recibir y validar peticiones HTTP
 * - Transformar datos de entrada y salida
 * - Manejar errores y códigos de respuesta HTTP
 * - Delegar la lógica de negocio al servicio de aplicación
 */
export class CategoryController {
  private app: CategoryApplicationService;

  constructor(app: CategoryApplicationService) {
    this.app = app;
  }

  async createCategory(req: Request, res: Response): Promise<Response> {
    const { nombre, descripcion, estado } = req.body;

    try {
      // Validaciones básicas de entrada
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
          error: "El nombre de la categoría es obligatorio",
        });
      }

      // Validación adicional del formato del nombre
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/;
      if (!nameRegex.test(nombre.trim())) {
        return res.status(400).json({
          error: "El nombre de la categoría contiene caracteres no válidos",
        });
      }

      // Validación de descripción si se proporciona
      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 1000 caracteres",
        });
      }

      // Preparar objeto de categoría para crear
      const category: Omit<Category, "id" | "fechaCreacion"> = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        estado: estado !== undefined ? estado : 1,
      };

      // Delegar al servicio de aplicación
      const categoryId = await this.app.createCategory(category);

      return res.status(201).json({
        message: "Categoría creada exitosamente",
        categoryId,
        category: {
          id: categoryId,
          ...category,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("ya existe") ||
          error.message.includes("obligatorio") ||
          error.message.includes("válido")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      const category = await this.app.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          error: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  async getCategoryByName(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre } = req.params;

      // Validación del parámetro nombre
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
          error: "El nombre de la categoría no puede estar vacío",
        });
      }

      // Delegar al servicio de aplicación
      const category = await this.app.getCategoryByName(nombre);

      if (!category) {
        return res.status(404).json({
          error: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }

  async getAllActiveCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.app.getAllActiveCategories();

      return res.status(200).json({
        message: "Categorías activas obtenidas exitosamente",
        count: categories.length,
        categories,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las categorías activas",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las categorías activas",
        details: "Error inesperado",
      });
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await this.app.getAllCategories();

      return res.status(200).json({
        message: "Todas las categorías obtenidas exitosamente",
        count: categories.length,
        categories,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las categorías",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error al obtener las categorías",
        details: "Error inesperado",
      });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, estado } = req.body;

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      // Validar que al menos un campo se esté actualizando
      if (!nombre && descripcion === undefined && estado === undefined) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Validaciones específicas de campos
      if (nombre && (!nombre.trim() || nombre.trim().length === 0)) {
        return res.status(400).json({
          error: "El nombre de la categoría no puede estar vacío",
        });
      }

      if (nombre && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/.test(nombre.trim())) {
        return res.status(400).json({
          error: "El nombre de la categoría contiene caracteres no válidos",
        });
      }

      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 1000 caracteres",
        });
      }

      if (estado !== undefined && ![0, 1].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser 0 (inactiva) o 1 (activa)",
        });
      }

      const categoryUpdate: Partial<Category> = {};
      if (nombre) categoryUpdate.nombre = nombre.trim();
      if (descripcion !== undefined)
        categoryUpdate.descripcion = descripcion
          ? descripcion.trim()
          : undefined;
      if (estado !== undefined) categoryUpdate.estado = estado;

      const updated = await this.app.updateCategory(id, categoryUpdate);

      if (!updated) {
        return res.status(404).json({
          error: "Categoría no encontrada o sin cambios",
        });
      }

      return res.status(200).json({
        message: "Categoría actualizada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("ya existe") ||
          error.message.includes("no encontrada") ||
          error.message.includes("válido")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }
  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido",
        });
      }

      // Delegar al servicio de aplicación
      const deleted = await this.app.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({
          error: "Categoría no encontrada",
        });
      }

      return res.status(200).json({
        message: "Categoría eliminada exitosamente",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("no encontrada") ||
          error.message.includes("en uso")
        ) {
          return res.status(400).json({
            error: error.message,
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado",
      });
    }
  }
}
