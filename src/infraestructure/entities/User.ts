import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "usuarios" })
export class User {
  @PrimaryGeneratedColumn()
  id_usuarios!: number;

  @Column({ type: "varchar", length: 255 })
  nombre!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "enum", enum: ["empleado", "soporte", "administrador"], default: "empleado" })
  rol!: "empleado" | "soporte" | "administrador";

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "int", default: 1 })
  status!: number;
}