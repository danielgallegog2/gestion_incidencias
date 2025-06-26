// domain/Incident.ts

/**
 * Interfaz que define la estructura del dominio Incident
 * Representa una incidencia en el contexto de negocio del sistema de gestión
 * Esta interfaz es independiente de la implementación de base de datos
 * y define todos los atributos necesarios para gestionar incidencias de TI
 */
export interface Incident {
  /**
   * Identificador único de la incidencia
   * Se asigna automáticamente al crear una nueva incidencia
   * Usado para referenciar y buscar incidencias específicas
   */
  id: number;

  /**
   * Título descriptivo y conciso de la incidencia
   * Debe ser claro y resumir el problema principal
   * Ejemplo: "No puedo acceder al sistema de nómina"
   */
  titulo: string;

  /**
   * Descripción detallada de la incidencia (opcional)
   * Permite al usuario explicar el problema con mayor detalle
   * Incluye pasos para reproducir, mensajes de error, etc.
   */
  descripcion?: string;

  /**
   * Estado actual del ciclo de vida de la incidencia
   * - "abierta": Recién creada, esperando asignación
   * - "en_progreso": Asignada y siendo trabajada por soporte
   * - "cerrada": Resuelta y finalizada
   */
  estado: "abierta" | "en_progreso" | "cerrada";

  /**
   * Identificador del usuario que reportó la incidencia
   * Referencia al empleado que experimentó el problema
   * Usado para comunicación y seguimiento
   */
  usuarioId: number;

  /**
   * Identificador del técnico de soporte asignado (opcional)
   * Se asigna cuando alguien del equipo de soporte toma la incidencia
   * Null cuando la incidencia aún no ha sido asignada
   */
  soporteId?: number;

  /**
   * Identificador de la categoría de la incidencia
   * Clasifica el tipo de problema (Hardware, Software, Red, etc.)
   * Ayuda en la organización y asignación de incidencias
   */
  categoriaId: number;

  /**
   * Identificador del nivel de prioridad
   * Define la urgencia de resolución (Baja, Media, Alta, Crítica)
   * Usado para determinar el orden de atención
   */
  prioridadId: number;

  /**
   * Fecha y hora de creación de la incidencia
   * Se establece automáticamente al reportar la incidencia
   * Usado para métricas de tiempo de respuesta y SLA
   */
  creadoEn: Date;

  /**
   * Fecha y hora de última actualización
   * Se actualiza cada vez que se modifica la incidencia
   * Útil para auditoría y seguimiento de cambios
   */
  actualizadoEn: Date;

  // Nota: Propiedades opcionales para datos relacionados cuando se incluyen en consultas
  /**
   * Datos del usuario que reportó (opcional)
   * Se incluye cuando se necesita información completa del reportador
   */
  usuario?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };

  /**
   * Datos del técnico de soporte asignado (opcional)
   * Se incluye cuando se necesita información del responsable
   */
  soporte?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };

  /**
   * Datos de la categoría (opcional)
   * Se incluye para mostrar el nombre de la categoría
   */
  categoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };

  /**
   * Datos de la prioridad (opcional)
   * Se incluye para mostrar el nivel y color de la prioridad
   */
  prioridad?: {
    id: number;
    nombre: string;
    nivel: number;
    color?: string;
  };
}