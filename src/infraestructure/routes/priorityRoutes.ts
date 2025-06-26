// routes/priorityRoutes.ts
import { Router } from "express";
import { PriorityController } from "../controller/PriorityController";
import { PriorityApplicationService } from "../../application/PriorityApplicationService";
import { PriorityAdapter } from "../adapter/PriorityAdapter";

/**
 * Configuración de rutas para las operaciones de prioridades
 * Implementa el patrón de enrutamiento RESTful
 *
 * Endpoints disponibles:
 * - POST   /priority                    - Crear nueva prioridad
 * - GET    /priority                    - Obtener todas las prioridades
 * - GET    /priority/active             - Obtener prioridades activas
 * - GET    /priority/:id                - Obtener prioridad por ID
 * - GET    /priority/by-name/:nombre    - Obtener prioridad por nombre
 * - GET    /priority/by-level/:nivel    - Obtener prioridad por nivel
 * - PUT    /priority/:id                - Actualizar prioridad
 * - DELETE /priority/:id                - Eliminar prioridad (lógica)
 */

// Instanciar las dependencias siguiendo el patrón de inyección de dependencias
// Adapter -> Service -> Controller
const priorityAdapter = new PriorityAdapter();
const priorityService = new PriorityApplicationService(priorityAdapter);
const priorityController = new PriorityController(priorityService);

// Crear el router de Express
const priorityRouter = Router();

/**
 * Ruta para crear una nueva prioridad
 * Método: POST
 * Endpoint: /priority
 * Body: {
 *   nombre: string,
 *   descripcion?: string,
 *   nivel: number,
 *   color?: string,
 *   estado?: number
 * }
 * Respuesta: { message: string, priorityId: number, priority: Priority }
 */
priorityRouter.post("/priority", async (req, res) => {
  try {
    await priorityController.createPriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error en la creacion de la prioridad",
    });
  }
});

/**
 * Ruta para obtener todas las prioridades del sistema
 * Método: GET
 * Endpoint: /priority
 * Respuesta: { message: string, count: number, priority: Priority[] }
 */
priorityRouter.get("/priority", async (req, res) => {
  try {
    await priorityController.getAllPriorities(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las prioridades",
    });
  }
});

/**
 * Ruta para obtener solo las prioridades activas ordenadas por nivel
 * Método: GET
 * Endpoint: /priority/active
 * Respuesta: { message: string, count: number, priority: Priority[] }
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos de enrutamiento
 */
priorityRouter.get("/priority/active", async (req, res) => {
  try {
    await priorityController.getAllActivePriorities(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las prioridades activas",
    });
  }
});

/**
 * Ruta para obtener una prioridad específica por su nombre
 * Método: GET
 * Endpoint: /priority/by-name/:nombre
 * Parámetros: nombre (string) - Nombre de la prioridad
 * Respuesta: { message: string, priority: Priority }
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos
 */
priorityRouter.get("/priority/by-name/:nombre", async (req, res) => {
  try {
    await priorityController.getPriorityByName(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por nombre",
    });
  }
});

/**
 * Ruta para obtener una prioridad específica por su nivel
 * Método: GET
 * Endpoint: /priority/by-level/:nivel
 * Parámetros: nivel (number) - Nivel numérico de la prioridad
 * Respuesta: { message: string, priority: Priority }
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos
 */
priorityRouter.get("/priority/by-level/:nivel", async (req, res) => {
  try {
    await priorityController.getPriorityByLevel(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por nivel",
    });
  }
});

/**
 * Ruta para obtener una prioridad específica por su ID
 * Método: GET
 * Endpoint: /priority/:id
 * Parámetros: id (number) - ID de la prioridad
 * Respuesta: { message: string, priority: Priority }
 */
priorityRouter.get("/priority/:id", async (req, res) => {
  try {
    await priorityController.getPriorityById(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la prioridad por ID",
    });
  }
});

/**
 * Ruta para actualizar una prioridad existente
 * Método: PUT
 * Endpoint: /priority/:id
 * Parámetros: id (number) - ID de la prioridad a actualizar
 * Body: {
 *   nombre?: string,
 *   descripcion?: string,
 *   nivel?: number,
 *   color?: string,
 *   estado?: number
 * }
 * Respuesta: { message: string }
 */
priorityRouter.put("/priority/:id", async (req, res) => {
  try {
    await priorityController.updatePriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar la prioridad",
    });
  }
});

/**
 * Ruta para eliminar una prioridad (eliminación lógica)
 * Método: DELETE
 * Endpoint: /priority/:id
 * Parámetros: id (number) - ID de la prioridad a eliminar
 * Respuesta: { message: string }
 */
priorityRouter.delete("/priority/:id", async (req, res) => {
  try {
    await priorityController.deletePriority(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al eliminar la prioridad",
    });
  }
});

// Exportar el router para su uso en la aplicación principal
export { priorityRouter };
