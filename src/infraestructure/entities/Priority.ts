// entities/Priority.ts
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";

/**
 * Entidad Priority que representa la tabla 'prioridades' en la base de datos
 * Esta entidad define la estructura de datos para los niveles de prioridad de las incidencias
 * Los niveles típicos son: Baja, Media, Alta, Crítica
 */
@Entity({ name: "prioridades" })
export class Priority {
  /**
   * Clave primaria de la tabla prioridades
   * Se genera automáticamente usando AUTO_INCREMENT
   */
  @PrimaryGeneratedColumn()
  id_prioridad!: number;

  /**
   * Nombre del nivel de prioridad
   * Ejemplos: "Baja", "Media", "Alta", "Crítica"
   * Campo obligatorio y único para evitar duplicados
   */
  @Column({ type: "varchar", length: 100, unique: true })
  nombre_prioridad!: string;

  /**
   * Descripción del nivel de prioridad
   * Explica cuándo debe usarse cada nivel de prioridad
   * Ej: "Para problemas que pueden esperar más de 24 horas"
   */
  @Column({ type: "text", nullable: true })
  descripcion_prioridad?: string;

  /**
   * Nivel numérico de prioridad para ordenamiento
   * Permite ordenar las prioridades de menor a mayor urgencia
   * Ej: 1=Baja, 2=Media, 3=Alta, 4=Crítica
   */
  @Column({ type: "int", default: 1 })
  nivel_prioridad!: number;

  /**
   * Color hexadecimal para representación visual
   * Permite mostrar las prioridades con colores en la interfaz
   * Ej: #28a745 (verde), #ffc107 (amarillo), #dc3545 (rojo)
   */
  @Column({ type: "varchar", length: 7, nullable: true })
  color_prioridad?: string;

  /**
   * Estado de la prioridad (activa/inactiva)
   * Por defecto es 1 (activa)
   * 0 = inactiva, 1 = activa
   */
  @Column({ type: "tinyint", default: 1 })
  estado_prioridad!: number;

  /**
   * Fecha de creación de la prioridad
   * Se establece automáticamente al momento de crear el registro
   */
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  fecha_creacion!: Date;

  // Nota: La relación OneToMany con Incidencias se definirá cuando creemos esa entidad
  // @OneToMany(() => Incidencia, incidencia => incidencia.prioridad)
  // incidencias!: Incidencia[];
}