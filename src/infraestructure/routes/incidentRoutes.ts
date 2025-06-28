import { Router } from "express";
import { IncidentController } from "../controller/IncidentController";
import { IncidentApplicationService } from "../../application/IncidentApplicationService";
import { IncidentAdapter } from "../adapter/IncidentAdapter";
import { authenticateToken } from "../web/authMiddleware";

/**
 * Configuración de rutas para las operaciones de incidencias
 */

const incidentAdapter = new IncidentAdapter();
const incidentService = new IncidentApplicationService(incidentAdapter);
const incidentController = new IncidentController(incidentService);

// Crear el router de Express
const incidentRouter = Router();

incidentRouter.post("/incidents", authenticateToken, async (req, res) => {
  try {
    await incidentController.createIncident(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error en la creación de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents", authenticateToken, async (req, res) => {
  try {
    await incidentController.getAllIncidents(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/statistics", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentStatistics(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las estadísticas",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/user/:usuarioId", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentsByUser(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias del usuario",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/support/:soporteId", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentsBySupport(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias del técnico",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/category/:categoriaId", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentsByCategory(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias de la categoría",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/priority/:prioridadId", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentsByPriority(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias de la prioridad",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.get("/incidents/:id", authenticateToken, async (req, res) => {
  try {
    await incidentController.getIncidentById(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la incidencia por ID",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.put("/incidents/:id", authenticateToken, async (req, res) => {
  try {
    await incidentController.updateIncident(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.patch("/incidents/:id/status", authenticateToken, async (req, res) => {
  try {
    await incidentController.changeIncidentStatus(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al cambiar el estado de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.patch("/incidents/:id/assign", authenticateToken, async (req, res) => {
  try {
    await incidentController.assignIncident(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al asignar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

incidentRouter.delete("/incidents/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await incidentController.deleteIncident(req, res, id);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
});

export { incidentRouter };
