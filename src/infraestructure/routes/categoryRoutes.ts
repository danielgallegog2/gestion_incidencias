import { Router } from "express";
import { CategoryController } from "../controller/CategoryController";
import { CategoryApplicationService } from "../../application/CategoryApplicationService";
import { CategoryAdapter } from "../adapter/CategoryAdapter";
import { authenticateToken } from "../web/authMiddleware";

/**
 * Configuración de rutas para las operaciones de categorías
 */

const categoryAdapter = new CategoryAdapter();
const categoryService = new CategoryApplicationService(categoryAdapter);
const categoryController = new CategoryController(categoryService);

// Crear el router de Express
const categoryRouter = Router();

categoryRouter.post("/categories", authenticateToken, async (req, res) => {
  try {
    await categoryController.createCategory(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error en la creacion de la categoría",
    });
  }
});

categoryRouter.get("/categories", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.getAllCategories(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las categorías",
    });
  }
});

categoryRouter.get("/categories/active", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.getAllActiveCategories(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener las categorías activas",
    });
  }
});

categoryRouter.get("/categories/:id", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.getCategoryById(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la categoría por ID",
    });
  }
});

categoryRouter.get("/categories/by-name/:nombre", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.getCategoryByName(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al obtener la categoría por nombre",
    });
  }
});

categoryRouter.put("/categories/:id", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.updateCategory(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error en la actualización de la categoría",
    });
  }
});

categoryRouter.delete("/categories/:id", authenticateToken, async (req, res, next) => {
  try {
    await categoryController.deleteCategory(req, res);
  } catch (error) {
    res.status(400).json({
      message: "Error al eliminar la categoría",
    });
  }
});

export { categoryRouter };
