import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

/**
 * Entidad Category que representa la tabla 'categorias' en la base de datos
 * Esta entidad define la estructura de datos para las categorías de incidencias
 * Utiliza TypeORM como ORM para el mapeo objeto-relacional
 */
@Entity({ name: "comentarios" })
export class Comments {
  @PrimaryGeneratedColumn()
  id_comentarios!: number;
  @Column({ type: "int" })
  incidencia_id!: number;
  @Column({ type: "int" })
  usuario_id!: number;
  @Column({ type: "text" })
  comentario!: string;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  creado_en!: Date;
}
