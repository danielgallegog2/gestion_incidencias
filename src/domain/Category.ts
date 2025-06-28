/**
 * Interfaz que define la estructura del dominio Category
 * Representa una categoría de incidencia en el contexto de negocio
 * Esta interfaz es independiente de la implementación de base de datos
 * y se usa en toda la capa de aplicación y dominio
 */
export interface Category {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: number;
  fechaCreacion: Date;
}
