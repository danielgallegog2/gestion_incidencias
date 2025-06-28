import { Router } from "express";
import { PriorityController } from "../controller/PriorityController";
import { PriorityApplicationService } from "../../application/PriorityApplicationService";
import { PriorityAdapter } from "../adapter/PriorityAdapter";
import { authenticateToken } from "../web/authMiddleware";

/**
 * Configuración de rutas para las operaciones de prioridades
 */

const priorityAdapter = new PriorityAdapter();
const priorityService = new PriorityApplicationService(priorityAdapter);
const priorityController = new PriorityController(priorityService);

// Crear el router de Express
const priorityRouter = Router();

priorityRouter.post("/priority", authenticateToken, async (req, res) => {
  try {
    await priorityController.createPriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error en la creacion de la prioridad",
    });
  }
});

priorityRouter.get("/priority", authenticateToken, async (req, res) => {
  try {
    await priorityController.getAllPriorities(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las prioridades",
    });
  }
});

priorityRouter.get("/priority/active", authenticateToken, async (req, res) => {
  try {
    await priorityController.getAllActivePriorities(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las prioridades activas",
    });
  }
});

priorityRouter.get("/priority/by-name/:nombre", authenticateToken, async (req, res) => {
  try {
    await priorityController.getPriorityByName(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por nombre",
    });
  }
});

priorityRouter.get("/priority/by-level/:nivel", authenticateToken, async (req, res) => {
  try {
    await priorityController.getPriorityByLevel(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por nivel",
    });
  }
});

priorityRouter.get("/priority/:id", authenticateToken, async (req, res) => {
  try {
    await priorityController.getPriorityById(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por ID",
    });
  }
});

priorityRouter.put("/priority/:id", authenticateToken, async (req, res) => {
  try {
    await priorityController.updatePriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar la prioridad",
    });
  }
});

priorityRouter.delete("/priority/:id", authenticateToken, async (req, res) => {
  try {
    await priorityController.deletePriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al eliminar la prioridad",
    });
  }
});

export { priorityRouter };
