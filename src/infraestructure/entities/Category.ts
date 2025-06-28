import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

/**
 * Entidad Category que representa la tabla 'categorias' en la base de datos
 * Esta entidad define la estructura de datos para las categorías de incidencias
 * Utiliza TypeORM como ORM para el mapeo objeto-relacional
 */
@Entity({ name: "categorias" })
export class Category {
  @PrimaryGeneratedColumn()
  id_categorias!: number;
  @Column({ type: "varchar", length: 100, unique: true })
  nombre!: string;
  @Column({ type: "text", nullable: true })
  descripcion?: string;
  @Column({ type: "tinyint", default: 1 })
  estado!: number;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion!: Date;
}
