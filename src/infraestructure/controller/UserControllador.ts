import { parse } from "dotenv";
import { UserApplicationService } from "../../application/UserApplicationService";
import { User } from "../../domain/User";
import { Request, Response } from "express";

export class UserController {
  private app: UserApplicationService;
  constructor(app: UserApplicationService) {
    this.app = app;
  }

  async login(req: Request, res: Response): Promise<string | Response> {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email y contraseña son requeridos" });

      // Validación de email
      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email))
        return res.status(400).json({ error: "Correo electrónico no válido" });

      // Validación de contraseña
      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,25}$/.test(password))
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres y máximo 25, incluyendo al menos una letra y un número",
        });

      const token = await this.app.login(email, password);
      return res.status(200).json({ token });
    } catch {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    const { name, email, password, rol } = req.body;
    try {
      
      // Validación con regex
      const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s[A-Za-zÁÉÍÓÚáéíóúÑñ]+)?$/;
      if (!nameRegex.test(name.trim()))
        return res.status(400).json({ message: "El nombre no es válido" });

      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
        return res
          .status(400)
          .json({ message: "Correo electrónico no válido" });

      if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,25}$/.test(password.trim()))
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres y máximo 25, una letra y un número",
        });

      // Validación del rol
      const validRoles = ["empleado", "soporte", "administrador"];
      if (rol && !validRoles.includes(rol)) {
        return res.status(400).json({
          error: "El rol debe ser: empleado, soporte o administrador",
        });
      }

      const user: Omit<User, "id" | "create_en"> = {
        name,
        email,
        password,
        rol: rol || "empleado",
        status: 0,
      };

      const userId = await this.app.createUser(user);

      return res
        .status(201)
        .json({ message: "Usuario creado exitosamente", userId });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error en el server",
          details: error.message,
        });
      }
      return res
        .status(500)
        .json({ error: "Error en el server", details: "Error inesperado" });
    }
  }
  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id))
        return res.status(400).json({ error: "El id debe ser un numero" });
      const user = await this.app.getUserById(id);
      if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error en el server",
          details: error.message,
        });
      }
      return res
        .status(500)
        .json({ error: "Error en el server", details: "Error inesperado" });
    }
  }
  async getUserByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.params;
      if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email))
        return res.status(400).json({ error: "Correo electronico no valido" });
      //validacion de email exitosa, procedemos a buscar el usuario
      const user = await this.app.getUserByEmail(email);
      if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error en el server",
          details: error.message,
        });
      }
      return res
        .status(500)
        .json({ error: "Error en el server", details: "Error inesperado" });
    }
  }
  async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.app.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({
        error: "Error la obtener los usuarios",
        details: "Error inesperado",
      });
    }
  }
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id))
        return res
          .status(400)
          .json({ error: "El id debe ser un numero o un id valido" });
      const deleted = await this.app.deleteUser(id);
      if (!deleted)
        return res.status(404).json({
          error: "Usuario no encontrado",
        });
      return res.status(200).json({
        message: "Usuario eliminado exitosamente",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "error al dar de baja", details: "Error inesperado" });
    }
  }
  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

      let { name, email, password, status, rol } = req.body;

      // Validaciones antes de actualizar
      if (name && !/^[a-zA-Z\s]{3,}$/.test(name.trim()))
        return res.status(400).json({
          error:
            "El nombre debe tener al menos 3 caracteres y solo contener letras",
        });

      if (email && !/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email.trim()))
        return res.status(400).json({ error: "Correo electrónico no válido" });

      if (
        password &&
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password.trim())
      ) {
        return res.status(400).json({
          error:
            "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
        });
      }

      // Validación del rol
      const validRoles = ["empleado", "soporte", "administrador"];
      if (rol && !validRoles.includes(rol)) {
        return res.status(400).json({
          error: "El rol debe ser: empleado, soporte o administrador",
        });
      }

      status = 1;

      const updated = await this.app.updateUser(id, {
        name,
        email,
        password,
        rol,
        status,
      });

      if (!updated)
        return res
          .status(404)
          .json({ error: "Usuario no encontrado o sin cambios" });

      return res.status(200).json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: "Error interno del servidor",
          details: error.message,
        });
      }
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }
}
