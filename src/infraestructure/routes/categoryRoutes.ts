// routes/categoryRoutes.ts
import { Router } from "express";
import { CategoryController } from "../controller/CategoryController";
import { CategoryApplicationService } from "../../application/CategoryApplicationService";
import { CategoryAdapter } from "../adapter/CategoryAdapter";

/**
 * Configuración de rutas para las operaciones de categorías
 * Implementa el patrón de enrutamiento RESTful
 *
 * Endpoints disponibles:
 * - POST   /categories                    - Crear nueva categoría
 * - GET    /categories                    - Obtener todas las categorías
 * - GET    /categories/active             - Obtener categorías activas
 * - GET    /categories/:id                - Obtener categoría por ID
 * - GET    /categories/by-name/:nombre    - Obtener categoría por nombre
 * - PUT    /categories/:id                - Actualizar categoría
 * - DELETE /categories/:id                - Eliminar categoría (lógica)
 */

// Instanciar las dependencias siguiendo el patrón de inyección de dependencias
// Adapter -> Service -> Controller
const categoryAdapter = new CategoryAdapter();
const categoryService = new CategoryApplicationService(categoryAdapter);
const categoryController = new CategoryController(categoryService);

// Crear el router de Express
const categoryRouter = Router();

/**
 * Ruta para crear una nueva categoría
 * Método: POST
 * Endpoint: /categories
 * Body: { nombre: string, descripcion?: string, estado?: number }
 * Respuesta: { message: string, categoryId: number, category: Category }
 */
categoryRouter.post("/categories", async (req, res) => {
  try {
    await categoryController.createCategory(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error en la creacion de la categoría",
    });
  }
});

/**
 * Ruta para obtener todas las categorías del sistema
 * Método: GET
 * Endpoint: /categories
 * Respuesta: { message: string, count: number, categories: Category[] }
 */
categoryRouter.get("/categories", async (req, res, next) => {
  try {
    await categoryController.getAllCategories(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener las categorías",
        })
  }
});

/**
 * Ruta para obtener solo las categorías activas
 * Método: GET
 * Endpoint: /categories/active
 * Respuesta: { message: string, count: number, categories: Category[] }
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos de enrutamiento
 */
categoryRouter.get("/categories/active", async (req, res, next) => {
  try {
    await categoryController.getAllActiveCategories(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener las categorías activas",
        })
  }
});

/**
 * Ruta para obtener una categoría específica por su ID
 * Método: GET
 * Endpoint: /categories/:id
 * Parámetros: id (number) - ID de la categoría
 * Respuesta: { message: string, category: Category }
 */
categoryRouter.get("/categories/:id", async (req, res, next) => {
  try {
    await categoryController.getCategoryById(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener la categoría por ID",
        })
  }
});

/**
 * Ruta para obtener una categoría específica por su nombre
 * Método: GET
 * Endpoint: /categories/by-name/:nombre
 * Parámetros: nombre (string) - Nombre de la categoría
 * Respuesta: { message: string, category: Category }
 */
categoryRouter.get("/categories/by-name/:nombre", async (req, res, next) => {
  try {
    await categoryController.getCategoryByName(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener la categoría por nombre",
        })
  }
});

/**
 * Ruta para actualizar una categoría existente
 * Método: PUT
 * Endpoint: /categories/:id
 * Parámetros: id (number) - ID de la categoría a actualizar
 * Body: { nombre?: string, descripcion?: string, estado?: number }
 * Respuesta: { message: string }
 */
categoryRouter.put("/categories/:id", async (req, res, next) => {
  try {
    await categoryController.updateCategory(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error en la actualización de la categoría",
        })
  }
});

/**
 * Ruta para eliminar una categoría (eliminación lógica)
 * Método: DELETE
 * Endpoint: /categories/:id
 * Parámetros: id (number) - ID de la categoría a eliminar
 * Respuesta: { message: string }
 */
categoryRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    await categoryController.deleteCategory(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al eliminar la categoría",
        })
  }
});

// Exportar el router para su uso en la aplicación principal
export { categoryRouter };
