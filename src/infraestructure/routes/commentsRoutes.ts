// routes/commentsRoutes.ts
import { Router } from "express";
import { CommentsController } from "../controller/commentsController";
import { CommentsApplicationService } from "../../application/CommentsApplicationService";
import { CommentsAdapter } from "../adapter/CommentsAdapter";
import { authenticateToken } from "../web/authMiddleware";

/**
 * Configuración de rutas para las operaciones de comentarios
 */

const commentsAdapter = new CommentsAdapter();
const commentsService = new CommentsApplicationService(commentsAdapter);
const commentsController = new CommentsController(commentsService);

// Crear el router de Express
const CommentsRouter = Router();

CommentsRouter.post("/comments", authenticateToken, async (req, res) => {
  try {
    await commentsController.createComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error en la creación del comentario",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

CommentsRouter.get("/comments", authenticateToken, async (req, res) => {
  try {
    await commentsController.getAllComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los comentarios",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

CommentsRouter.get("/comments/:id", authenticateToken, async (req, res) => {
  try {
    await commentsController.getCommentsById(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el comentario por ID",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

CommentsRouter.put("/comments/:id", authenticateToken, async (req, res) => {
  try {
    await commentsController.updateComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error en la actualización del comentario",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

CommentsRouter.delete("/comments/:id", authenticateToken, async (req, res) => {
  try {
    await commentsController.deleteComments(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el comentario",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

CommentsRouter.get("/comments/incidencia/:incidenciaId", authenticateToken, async (req, res) => {
  try {
    await commentsController.getCommentsByIncidencia(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los comentarios de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

export { CommentsRouter };
