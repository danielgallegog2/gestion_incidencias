// domain/Priority.ts

/**
 * Interfaz que define la estructura del dominio Priority
 * Representa un nivel de prioridad de incidencia en el contexto de negocio
 * Esta interfaz es independiente de la implementación de base de datos
 * y define los niveles de urgencia para la atención de incidencias
 */
export interface Priority {
  /**
   * Identificador único de la prioridad
   * Se asigna automáticamente al crear una nueva prioridad
   */
  id: number;

  /**
   * Nombre del nivel de prioridad
   * Debe ser único y claro sobre el nivel de urgencia
   * Ejemplos: "Baja", "Media", "Alta", "Crítica"
   */
  nombre: string;

  /**
   * Descripción detallada del nivel de prioridad (opcional)
   * Explica los criterios para asignar este nivel de prioridad
   * Ej: "Para problemas que afectan a múltiples usuarios y requieren atención inmediata"
   */
  descripcion?: string;

  /**
   * Nivel numérico para ordenamiento y comparación
   * Permite ordenar las prioridades de menor a mayor urgencia
   * Valores típicos: 1=Baja, 2=Media, 3=Alta, 4=Crítica
   */
  nivel: number;

  /**
   * Color hexadecimal para representación visual (opcional)
   * Permite mostrar las prioridades con códigos de color en la interfaz
   * Ej: "#28a745" (verde para baja), "#dc3545" (rojo para crítica)
   */
  color?: string;

  /**
   * Estado actual de la prioridad
   * 1 = Activa (disponible para asignar a incidencias)
   * 0 = Inactiva (no disponible para nuevas asignaciones)
   */
  estado: number;

  /**
   * Fecha y hora de creación de la prioridad
   * Se establece automáticamente al crear la prioridad
   * Útil para auditoría y seguimiento del sistema
   */
  fechaCreacion: Date;
}