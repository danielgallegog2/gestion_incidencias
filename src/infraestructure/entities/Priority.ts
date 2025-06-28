import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

/**
 * Entidad Priority que representa la tabla 'prioridades' en la base de datos
 * Esta entidad define la estructura de datos para los niveles de prioridad de las incidencias
 * Los niveles típicos son: Baja, Media, Alta, Crítica
 */

@Entity({ name: "prioridades" })
export class Priority {
  @PrimaryGeneratedColumn()
  id_prioridad!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  nombre_prioridad!: string;
  @Column({ type: "text", nullable: true })
  descripcion_prioridad?: string;
  @Column({ type: "int", default: 1 })
  nivel_prioridad!: number;
  @Column({ type: "varchar", length: 7, nullable: true })
  color_prioridad?: string;
  @Column({ type: "tinyint", default: 1 })
  estado_prioridad!: number;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion!: Date;
}
