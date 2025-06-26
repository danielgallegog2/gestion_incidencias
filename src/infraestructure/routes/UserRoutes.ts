import { Router } from "express";
import { UserAdapter } from '../adapter/UserAdapter';
import { UserApplicationService } from "../../application/UserApplicationService";
import { UserController } from "../controller/UserControllador";
import { authenticateToken } from "../web/authMiddleware";

const router = Router();

//inicializacion de las capas

const userAdapter = new UserAdapter();
const userAppService = new UserApplicationService(userAdapter);
const userController = new UserController(userAppService);

//definir las rutas con manejo de errores

router.post("/login", async (req, res) => {
        await userController.login(req, res);
});

router.get("/users", authenticateToken, async (req, res) => {
    try {
        await userController.getAllUsers(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error al obtener los usuarios",
        })
    }
});

router.post("/users", async (req, res) => {
    try {
        await userController.createUser(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error en la creacion de usuario",
        })
    }
});

router.get("/users/:id", authenticateToken, async (req, res) => {
    try {
        await userController.getUserById(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error al obtener el usuario por id",
        })
    }
});

router.get("/users-mail/:email", authenticateToken, async (req, res) => {
    try {
        await userController.getUserByEmail(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error al obtener el usuario por email",
        })
    }
});

router.delete("/users/:id", authenticateToken, async (req, res) => {
    try {
        await userController.deleteUser(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error al obtener el usuario por id",
        })
    }
});

router.put("/users/:id", authenticateToken, async (req, res) => {
    try {
        await userController.updateUser(req, res);
    } catch (error) {
        res.status(400).json({
            message: "Error en la creacion de usuario",
        })
    }
});

export default router;