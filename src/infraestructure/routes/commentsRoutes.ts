// routes/commentsRoutes.ts
import { Router } from "express";
import { CommentsController } from "../controller/commentsController";
import { CommentsApplicationService } from "../../application/CommentsApplicationService";
import { CommentsAdapter } from "../adapter/CommentsAdapter";

/**
 * Configuración de rutas para las operaciones de comentarios
 * Implementa el patrón de enrutamiento RESTful
 *
 * Endpoints disponibles:
 * - POST   /comments                        - Crear nuevo comentario
 * - GET    /comments                        - Obtener todos los comentarios
 * - GET    /comments/:id                    - Obtener comentario por ID
 * - PUT    /comments/:id                    - Actualizar comentario
 * - DELETE /comments/:id                    - Eliminar comentario
 * - GET    /comments/incidencia/:incidenciaId - Obtener comentarios por incidencia
 */

// Instanciar las dependencias siguiendo el patrón de inyección de dependencias
// Adapter -> Service -> Controller
const commentsAdapter = new CommentsAdapter();
const commentsService = new CommentsApplicationService(commentsAdapter);
const commentsController = new CommentsController(commentsService);

// Crear el router de Express
const CommentsRouter = Router();

/**
 * Ruta para crear un nuevo comentario
 * Método: POST
 * Endpoint: /comments
 * Body: { comentario: string, incidencia: number, usuario: number }
 * Respuesta: { message: string, commentsId: number, comments: Comments }
 */
CommentsRouter.post("/comments", async (req, res) => {
  try {
    await commentsController.createComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error en la creación del comentario",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener todos los comentarios del sistema
 * Método: GET
 * Endpoint: /comments
 * Respuesta: { message: string, count: number, comments: Comments[] }
 */
CommentsRouter.get("/comments", async (req, res) => {
  try {
    await commentsController.getAllComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los comentarios",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener un comentario específico por su ID
 * Método: GET
 * Endpoint: /comments/:id
 * Parámetros: id (number) - ID del comentario
 * Respuesta: { message: string, comment: Comments }
 */
CommentsRouter.get("/comments/:id", async (req, res) => {
  try {
    await commentsController.getCommentsById(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el comentario por ID",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para actualizar un comentario existente
 * Método: PUT
 * Endpoint: /comments/:id
 * Parámetros: id (number) - ID del comentario a actualizar
 * Body: { comentario?: string, incidencia?: number, usuario?: number }
 * Respuesta: { message: string }
 */
CommentsRouter.put("/comments/:id", async (req, res) => {
  try {
    await commentsController.updateComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error en la actualización del comentario",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para eliminar un comentario
 * Método: DELETE
 * Endpoint: /comments/:id
 * Parámetros: id (number) - ID del comentario a eliminar
 * Respuesta: { message: string }
 */
CommentsRouter.delete("/comments/:id", async (req, res) => {
  try {
    await commentsController.deleteComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el comentario",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener comentarios por ID de incidencia
 * Método: GET
 * Endpoint: /comments/incidencia/:incidenciaId
 * Parámetros: incidenciaId (number) - ID de la incidencia
 * Respuesta: { message: string, incidenciaId: number, count: number, comments: Comments[] }
 */
CommentsRouter.get("/comments/incidencia/:incidenciaId", async (req, res) => {
  try {
    await commentsController.getCommentsByIncidencia(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los comentarios de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

// Exportar el router para su uso en la aplicación principal
export { CommentsRouter };