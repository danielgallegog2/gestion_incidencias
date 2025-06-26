// controllers/CategoryController.ts
import { CategoryApplicationService } from "../../application/CategoryApplicationService";
import { Category } from '../../domain/Category';
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

  /**
   * Constructor que recibe el servicio de aplicación de categorías
   * Implementa el patrón de inyección de dependencias
   * @param app - Servicio de aplicación de categorías
   */
  constructor(app: CategoryApplicationService) {
    this.app = app;
  }

  /**
   * Crea una nueva categoría
   * Endpoint: POST /categories
   * @param req - Request con los datos de la categoría en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado
   */
  async createCategory(req: Request, res: Response): Promise<Response> {
    const { nombre, descripcion, estado } = req.body;
    
    try {
      // Validaciones básicas de entrada
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ 
          error: "El nombre de la categoría es obligatorio" 
        });
      }

      // Validación adicional del formato del nombre
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/;
      if (!nameRegex.test(nombre.trim())) {
        return res.status(400).json({ 
          error: "El nombre de la categoría contiene caracteres no válidos" 
        });
      }

      // Validación de descripción si se proporciona
      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({ 
          error: "La descripción no puede exceder los 1000 caracteres" 
        });
      }

      // Preparar objeto de categoría para crear
      const category: Omit<Category, "id" | "fechaCreacion"> = {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : undefined,
        estado: estado !== undefined ? estado : 1
      };

      // Delegar al servicio de aplicación
      const categoryId = await this.app.createCategory(category);

      return res.status(201).json({
        message: "Categoría creada exitosamente",
        categoryId,
        category: {
          id: categoryId,
          ...category
        }
      });

    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        // Errores de negocio (duplicados, validaciones, etc.)
        if (error.message.includes("ya existe") || 
            error.message.includes("obligatorio") ||
            error.message.includes("válido")) {
          return res.status(400).json({
            error: error.message
          });
        }

        // Errores del servidor
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene una categoría por su ID
   * Endpoint: GET /categories/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la categoría encontrada
   */
  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
          error: "El ID debe ser un número positivo válido" 
        });
      }

      // Delegar al servicio de aplicación
      const category = await this.app.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ 
          error: "Categoría no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene una categoría por su nombre
   * Endpoint: GET /categories/by-name/:nombre
   * @param req - Request con el nombre en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con la categoría encontrada
   */
  async getCategoryByName(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre } = req.params;
      
      // Validación del parámetro nombre
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ 
          error: "El nombre de la categoría no puede estar vacío" 
        });
      }

      // Delegar al servicio de aplicación
      const category = await this.app.getCategoryByName(nombre);
      
      if (!category) {
        return res.status(404).json({ 
          error: "Categoría no encontrada" 
        });
      }

      return res.status(200).json({
        message: "Categoría encontrada",
        category
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene todas las categorías activas
   * Endpoint: GET /categories/active
   * @param req - Request object
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con las categorías activas
   */
  async getAllActiveCategories(req: Request, res: Response): Promise<Response> {
    try {
      // Delegar al servicio de aplicación
      const categories = await this.app.getAllActiveCategories();

      return res.status(200).json({
        message: "Categorías activas obtenidas exitosamente",
        count: categories.length,
        categories
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las categorías activas",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error al obtener las categorías activas",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Obtiene todas las categorías del sistema
   * Endpoint: GET /categories
   * @param req - Request object
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con todas las categorías
   */
  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      // Delegar al servicio de aplicación
      const categories = await this.app.getAllCategories();

      return res.status(200).json({
        message: "Todas las categorías obtenidas exitosamente",
        count: categories.length,
        categories
      });

    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error al obtener las categorías",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error al obtener las categorías",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Actualiza una categoría existente
   * Endpoint: PUT /categories/:id
   * @param req - Request con el ID en parámetros y datos a actualizar en el body
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado de la actualización
   */
  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      const { nombre, descripcion, estado } = req.body;

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ 
          error: "El ID debe ser un número positivo válido" 
        });
      }

      // Validar que al menos un campo se esté actualizando
      if (!nombre && descripcion === undefined && estado === undefined) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar"
        });
      }

      // Validaciones específicas de campos
      if (nombre && (!nombre.trim() || nombre.trim().length === 0)) {
        return res.status(400).json({
          error: "El nombre de la categoría no puede estar vacío"
        });
      }

      if (nombre && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_]+$/.test(nombre.trim())) {
        return res.status(400).json({
          error: "El nombre de la categoría contiene caracteres no válidos"
        });
      }

      if (descripcion && descripcion.length > 1000) {
        return res.status(400).json({
          error: "La descripción no puede exceder los 1000 caracteres"
        });
      }

      if (estado !== undefined && ![0, 1].includes(estado)) {
        return res.status(400).json({
          error: "El estado debe ser 0 (inactiva) o 1 (activa)"
        });
      }

      // Preparar objeto de actualización
      const categoryUpdate: Partial<Category> = {};
      if (nombre) categoryUpdate.nombre = nombre.trim();
      if (descripcion !== undefined) categoryUpdate.descripcion = descripcion ? descripcion.trim() : undefined;
      if (estado !== undefined) categoryUpdate.estado = estado;

      // Delegar al servicio de aplicación
      const updated = await this.app.updateCategory(id, categoryUpdate);

      if (!updated) {
        return res.status(404).json({
          error: "Categoría no encontrada o sin cambios"
        });
      }

      return res.status(200).json({
        message: "Categoría actualizada exitosamente"
      });

    } catch (error) {
      if (error instanceof Error) {
        // Errores de negocio
        if (error.message.includes("ya existe") || 
            error.message.includes("no encontrada") ||
            error.message.includes("válido")) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }

  /**
   * Elimina una categoría (eliminación lógica)
   * Endpoint: DELETE /categories/:id
   * @param req - Request con el ID en los parámetros
   * @param res - Response para enviar la respuesta
   * @returns Promise<Response> - Respuesta HTTP con el resultado de la eliminación
   */
  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);

      // Validación del parámetro ID
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          error: "El ID debe ser un número positivo válido"
        });
      }

      // Delegar al servicio de aplicación
      const deleted = await this.app.deleteCategory(id);

      if (!deleted) {
        return res.status(404).json({
          error: "Categoría no encontrada"
        });
      }

      return res.status(200).json({
        message: "Categoría eliminada exitosamente"
      });

    } catch (error) {
      if (error instanceof Error) {
        // Errores de negocio
        if (error.message.includes("no encontrada") ||
            error.message.includes("en uso")) {
          return res.status(400).json({
            error: error.message
          });
        }

        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message
        });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
        details: "Error inesperado"
      });
    }
  }
}