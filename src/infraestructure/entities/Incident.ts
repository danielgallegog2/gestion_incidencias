// entities/Incident.ts
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Priority } from "./Priority";

@Entity({ name: "incidencias" })
export class Incident {
  @PrimaryGeneratedColumn()
  id_incidencias!: number;

  @Column({ type: "varchar", length: 150 })
  titulo!: string;

  @Column({ type: "text", nullable: true })
  descripcion?: string;

  @Column({ 
    type: "enum", 
    enum: ["abierta", "en_progreso", "cerrada"], 
    default: "abierta" 
  })
  estado!: "abierta" | "en_progreso" | "cerrada";

  @Column({ type: "int" })
  usuario_id!: number;

  @Column({ type: "int", nullable: true })
  soporte_id: number | null | undefined;

  @Column({ type: "int" })
  categoria_id!: number;

  @Column({ type: "int" })
  prioridad_id!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  creado_en!: Date;

  @Column({ 
    type: "timestamp", 
    default: () => "CURRENT_TIMESTAMP", 
    onUpdate: "CURRENT_TIMESTAMP" 
  })
  actualizado_en!: Date;

  // RELACIONES - Configura sin eager loading por defecto
  @ManyToOne(() => User, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "usuario_id" })
  usuario!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "soporte_id" })
  soporte?: User;

  @ManyToOne(() => Category, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "categoria_id" })
  categoria!: Category;

  @ManyToOne(() => Priority, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "prioridad_id" })
  prioridad!: Priority;
}