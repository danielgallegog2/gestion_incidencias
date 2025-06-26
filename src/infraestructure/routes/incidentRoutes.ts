// routes/incidentRoutes.ts
import { Router } from "express";
import { IncidentController } from "../controller/IncidentController";
import { IncidentApplicationService } from "../../application/IncidentApplicationService";
import { IncidentAdapter } from "../adapter/IncidentAdapter";

/**
 * Configuración de rutas para las operaciones de incidencias
 * Implementa el patrón de enrutamiento RESTful
 * 
 * IMPORTANTE: El orden de las rutas es crucial para evitar conflictos
 * Las rutas específicas deben ir antes que las rutas con parámetros
 * 
 * Endpoints disponibles:
 * - POST   /incidents                           - Crear nueva incidencia
 * - GET    /incidents                           - Obtener todas las incidencias con filtros
 * - GET    /incidents/statistics                - Obtener estadísticas de incidencias
 * - GET    /incidents/user/:usuarioId           - Obtener incidencias por usuario
 * - GET    /incidents/support/:soporteId        - Obtener incidencias por técnico
 * - GET    /incidents/category/:categoriaId     - Obtener incidencias por categoría
 * - GET    /incidents/priority/:prioridadId     - Obtener incidencias por prioridad
 * - GET    /incidents/:id                       - Obtener incidencia por ID
 * - PUT    /incidents/:id                       - Actualizar incidencia completa
 * - PATCH  /incidents/:id/status               - Cambiar estado de incidencia
 * - PATCH  /incidents/:id/assign               - Asignar/desasignar incidencia
 * - DELETE /incidents/:id                       - Eliminar incidencia
 */

// Instanciar las dependencias siguiendo el patrón de inyección de dependencias
// Adapter -> Service -> Controller
const incidentAdapter = new IncidentAdapter();
const incidentService = new IncidentApplicationService(incidentAdapter);
const incidentController = new IncidentController(incidentService);

// Crear el router de Express
const incidentRouter = Router();

/**
 * RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros)
 */

/**
 * Ruta para crear una nueva incidencia
 * Método: POST
 * Endpoint: /incidents
 * Body: { 
 *   titulo: string, 
 *   descripcion?: string, 
 *   usuarioId: number, 
 *   categoriaId: number, 
 *   prioridadId: number,
 *   soporteId?: number 
 * }
 * Respuesta: { message: string, incidentId: number, incident: Incident }
 */
incidentRouter.post("/incidents", async (req, res) => {
  try {
    await incidentController.createIncident(req, res)
  } catch (error) {
    res.status(500).json({
      message: "Error en la creación de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener todas las incidencias con filtros opcionales
 * Método: GET
 * Endpoint: /incidents
 * Query Parameters: 
 *   - estado?: "abierta" | "en_progreso" | "cerrada"
 *   - usuarioId?: number
 *   - soporteId?: number
 *   - categoriaId?: number
 *   - prioridadId?: number
 *   - fechaDesde?: string (ISO date)
 *   - fechaHasta?: string (ISO date)
 *   - include?: "relations" (para incluir datos relacionados)
 * Respuesta: { message: string, count: number, incidents: Incident[] }
 */
incidentRouter.get("/incidents", async (req, res) => {
  try {
    await incidentController.getAllIncidents(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener estadísticas de incidencias
 * Método: GET
 * Endpoint: /incidents/statistics
 * Query Parameters:
 *   - fechaDesde?: string (ISO date)
 *   - fechaHasta?: string (ISO date)
 *   - usuarioId?: number
 *   - categoriaId?: number
 * Respuesta: { message: string, statistics: object }
 */
incidentRouter.get("/incidents/statistics", async (req, res) => {
  try {
    await incidentController.getIncidentStatistics(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las estadísticas",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener incidencias por usuario
 * Método: GET
 * Endpoint: /incidents/user/:usuarioId
 * Parámetros: usuarioId (number) - ID del usuario
 * Query Parameters:
 *   - estado?: "abierta" | "en_progreso" | "cerrada"
 *   - include?: "relations"
 * Respuesta: { message: string, count: number, incidents: Incident[] }
 */
incidentRouter.get("/incidents/user/:usuarioId", async (req, res) => {
  try {
    await incidentController.getIncidentsByUser(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias del usuario",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener incidencias por técnico de soporte
 * Método: GET
 * Endpoint: /incidents/support/:soporteId
 * Parámetros: soporteId (number) - ID del técnico de soporte
 * Query Parameters:
 *   - estado?: "abierta" | "en_progreso" | "cerrada"
 *   - include?: "relations"
 * Respuesta: { message: string, count: number, incidents: Incident[] }
 */
incidentRouter.get("/incidents/support/:soporteId", async (req, res) => {
  try {
    await incidentController.getIncidentsBySupport(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias del técnico",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener incidencias por categoría
 * Método: GET
 * Endpoint: /incidents/category/:categoriaId
 * Parámetros: categoriaId (number) - ID de la categoría
 * Query Parameters:
 *   - estado?: "abierta" | "en_progreso" | "cerrada"
 *   - include?: "relations"
 * Respuesta: { message: string, count: number, incidents: Incident[] }
 */
incidentRouter.get("/incidents/category/:categoriaId", async (req, res) => {
  try {
    await incidentController.getIncidentsByCategory(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias de la categoría",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para obtener incidencias por prioridad
 * Método: GET
 * Endpoint: /incidents/priority/:prioridadId
 * Parámetros: prioridadId (number) - ID de la prioridad
 * Query Parameters:
 *   - estado?: "abierta" | "en_progreso" | "cerrada"
 *   - include?: "relations"
 * Respuesta: { message: string, count: number, incidents: Incident[] }
 */
incidentRouter.get("/incidents/priority/:prioridadId", async (req, res) => {
  try {
    await incidentController.getIncidentsByPriority(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las incidencias de la prioridad",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * RUTAS CON PARÁMETROS AL FINAL
 */

/**
 * Ruta para obtener una incidencia específica por su ID
 * Método: GET
 * Endpoint: /incidents/:id
 * Parámetros: id (number) - ID de la incidencia
 * Query Parameters:
 *   - include?: "relations" (para incluir datos relacionados)
 * Respuesta: { message: string, incident: Incident }
 */
incidentRouter.get("/incidents/:id", async (req, res) => {
  try {
    await incidentController.getIncidentById(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la incidencia por ID",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para actualizar una incidencia existente
 * Método: PUT
 * Endpoint: /incidents/:id
 * Parámetros: id (number) - ID de la incidencia a actualizar
 * Body: { 
 *   titulo?: string, 
 *   descripcion?: string, 
 *   estado?: "abierta" | "en_progreso" | "cerrada",
 *   soporteId?: number,
 *   categoriaId?: number,
 *   prioridadId?: number
 * }
 * Respuesta: { message: string }
 */
incidentRouter.put("/incidents/:id", async (req, res) => {
  try {
    await incidentController.updateIncident(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para cambiar el estado de una incidencia
 * Método: PATCH
 * Endpoint: /incidents/:id/status
 * Parámetros: id (number) - ID de la incidencia
 * Body: { estado: "abierta" | "en_progreso" | "cerrada" }
 * Respuesta: { message: string }
 */
incidentRouter.patch("/incidents/:id/status", async (req, res) => {
  try {
    await incidentController.changeIncidentStatus(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al cambiar el estado de la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para asignar/desasignar una incidencia a un técnico
 * Método: PATCH
 * Endpoint: /incidents/:id/assign
 * Parámetros: id (number) - ID de la incidencia
 * Body: { soporteId: number | null } (null para desasignar)
 * Respuesta: { message: string }
 */
incidentRouter.patch("/incidents/:id/assign", async (req, res) => {
  try {
    await incidentController.assignIncident(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error al asignar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

/**
 * Ruta para eliminar una incidencia
 * Método: DELETE
 * Endpoint: /incidents/:id
 * Parámetros: id (number) - ID de la incidencia a eliminar
 * Respuesta: { message: string }
 * 
 * Nota: En sistemas de incidencias, generalmente es mejor cambiar el estado
 * a "cerrada" en lugar de eliminar físicamente los registros.
 */
incidentRouter.delete("/incidents/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await incidentController.deleteIncident(req, res, id);
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la incidencia",
      error: error instanceof Error ? error.message : "Error inesperado"
    });
  }
});

// Exportar el router para su uso en la aplicación principal
export { incidentRouter };