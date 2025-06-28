import { Repository } from "typeorm";
import { User as UserDomain, User } from "../../domain/User";
import { UserPort } from "../../domain/UserPort";
import { User as UserEntity } from "../entities/User";
import { AppDataSource } from "../config/data-base";

export class UserAdapter implements UserPort {
  private UserRepository: Repository<UserEntity>;
  constructor() {
    this.UserRepository = AppDataSource.getRepository(UserEntity);
  }
  private toDomain(usuarios: UserEntity): UserDomain {
    return {
      id: usuarios.id_usuarios,
      name: usuarios.nombre,
      email: usuarios.email,
      rol: usuarios.rol,
      password: usuarios.password,
      status: usuarios.status,
    };
  }
  private toEntity(usuario: Omit<UserDomain, "id">): UserEntity {
    const userEntity = new UserEntity();
    userEntity.nombre = usuario.name;
    userEntity.email = usuario.email;
    userEntity.rol = usuario.rol || "empleado"; // ROL POR DEFECTO
    userEntity.password = usuario.password;
    userEntity.status = usuario.status || 1;
    return userEntity;
  }

  async createUser(
    usuario: Omit<UserDomain, "id" | "create_en">
  ): Promise<number> {
    try {
      const newUser = this.toEntity(usuario);
      const savedUser = await this.UserRepository.save(newUser);
      return savedUser.id_usuarios;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }
  async getUserById(id: number): Promise<UserDomain | null> {
    try {
      const user = await this.UserRepository.findOne({
        where: { id_usuarios: id },
      });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Failed to fetch user by ID");
    }
  }
  async getUserByEmail(email: string): Promise<UserDomain | null> {
    try {
      const user = await this.UserRepository.findOne({
        where: { email: email },
      });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw new Error("Failed to fetch user by email");
    }
  }
  async updateUser(id: number, user: Partial<UserDomain>): Promise<boolean> {
    try {
      const existingUser = await this.UserRepository.findOne({
        where: { id_usuarios: id },
      });
      if (!existingUser) {
        throw new Error("User not found");
      }

      Object.assign(existingUser, {
        nombre: user.name ?? existingUser.nombre,
        email: user.email ?? existingUser.email,
        rol: user.rol ?? existingUser.rol,
        password: user.password ?? existingUser.password,
        status: 1,
      });
      await this.UserRepository.save(existingUser);
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }
  async deleteUser(id: number): Promise<boolean> {
    try {
      const existingUser = await this.UserRepository.findOne({
        where: { id_usuarios: id },
      });
      if (!existingUser) {
        throw new Error("User not found");
      }

      Object.assign(existingUser, {
        status: 0,
      });
      await this.UserRepository.save(existingUser);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  async getAllUsers(): Promise<UserDomain[]> {
    try {
      const users = await this.UserRepository.find();
      return users.map((user) => this.toDomain(user));
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch all users");
    }
  }

  async getAllUsers1(): Promise<UserDomain[]> {
    try {
      const users = await this.UserRepository.find();
      return users.map((user) => this.toDomain(user));
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch all users");
    }
  }
}
