// routes/categoryRoutes.ts
import { Router } from "express";
import { CommentsController } from "../controller/commentsController";
import { CommentsApplicationService } from "../../application/CommentsApplicationService";
import { CommentsAdapter } from "../adapter/CommentsAdapter";

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
const commentsAdapter = new CommentsAdapter();
const commentsService = new CommentsApplicationService(commentsAdapter);
const commentsController = new CommentsController(commentsService);

// Crear el router de Express
const CommentsRouter = Router();

/**
 * Ruta para crear una nueva categoría
 * Método: POST
 * Endpoint: /categories
 * Body: { nombre: string, descripcion?: string, estado?: number }
 * Respuesta: { message: string, categoryId: number, category: Category }
 */
CommentsRouter.post("/comments", async (req, res) => {
  try {
    await commentsController.createComments(req, res);
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
CommentsRouter.get("/comments", async (req, res, next) => {
  try {
    await commentsController.getAllComments(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener las categorías",
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
CommentsRouter.get("/comments/:id", async (req, res, next) => {
  try {
    await commentsController.getCommentsById(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error al obtener la categoría por ID",
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

CommentsRouter.put("/comments/:id", async (req, res, next) => {
  try {
    await commentsController.updateComments(req, res);
  } catch (error) {
    res.status(400).json({
            message: "Error en la actualización de la categoría",
        })
  }
});

// Exportar el router para su uso en la aplicación principal
export { CommentsRouter };
