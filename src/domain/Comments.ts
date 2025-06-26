/**
 * Interfaz que define la estructura del dominio Comments
 * Representa una categoría de incidencia en el contexto de negocio
 * Esta interfaz es independiente de la implementación de base de datos
 * y se usa en toda la capa de aplicación y dominio
 */
export interface Comments {
  /**
   * Identificador único de la categoría
   * Se asigna automáticamente al crear una nueva categoría
   */
  id: number;

  /**
   * Nombre descriptivo de la categoría
   * Debe ser único y descriptivo del tipo de incidencias que agrupa
   * Ejemplos: "Problemas de Hardware", "Errores de Software", "Conectividad de Red"
   */
  incidencia: number;

  /**
   * Descripción detallada de la categoría (opcional)
   * Proporciona contexto adicional sobre qué tipo de problemas incluye
   * Ayuda a los usuarios a seleccionar la categoría correcta
   */
  usuario: number;

  /**
   * Estado actual de la categoría
   * 1 = Activa (disponible para nuevas incidencias)
   * 0 = Inactiva (no disponible para nuevas incidencias)
   */
  comentario: string;

  /**
   * Fecha y hora de creación de la categoría
   * Se establece automáticamente al crear la categoría
   * Útil para auditoría y seguimiento
   */
  fechaCreacion: Date;
}