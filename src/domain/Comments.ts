/**
 * Interfaz que define la estructura del dominio Comments
 * Representa una categoría de incidencia en el contexto de negocio
 * Esta interfaz es independiente de la implementación de base de datos
 * y se usa en toda la capa de aplicación y dominio
 */
export interface Comments {
  id: number;
  incidencia: number;
  usuario: number;
  comentario: string;
  fechaCreacion: Date;
}
