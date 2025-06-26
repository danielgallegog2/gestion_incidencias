// entities/Category.ts
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

/**
 * Entidad Category que representa la tabla 'categorias' en la base de datos
 * Esta entidad define la estructura de datos para las categorías de incidencias
 * Utiliza TypeORM como ORM para el mapeo objeto-relacional
 */
@Entity({ name: "categorias" })
export class Category {
  /**
   * Clave primaria de la tabla categorias
   * Se genera automáticamente usando AUTO_INCREMENT
   */
  @PrimaryGeneratedColumn()
  id_categorias!: number;

  /**
   * Nombre de la categoría (ej: "Hardware", "Software", "Red", etc.)
   * Campo obligatorio con máximo 100 caracteres
   * Debe ser único para evitar categorías duplicadas
   */
  @Column({ type: "varchar", length: 100, unique: true })
  nombre!: string;

  /**
   * Descripción opcional de la categoría
   * Permite dar más contexto sobre qué tipo de incidencias agrupa
   * Campo de texto largo para descripciones detalladas
   */
  @Column({ type: "text", nullable: true })
  descripcion?: string;

  /**
   * Estado de la categoría (activa/inactiva)
   * Por defecto es 1 (activa)
   * 0 = inactiva, 1 = activa
   */
  @Column({ type: "tinyint", default: 1 })
  estado!: number;

  /**
   * Fecha de creación de la categoría
   * Se establece automáticamente al momento de crear el registro
   * Utiliza el timestamp actual del servidor de base de datos
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion!: Date;

  // Nota: La relación OneToMany con Incidencias se definirá cuando creemos esa entidad
  // @OneToMany(() => Incidencia, incidencia => incidencia.categoria)
  // incidencias!: Incidencia[];
}