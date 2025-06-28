/**
 * Interfaz que define la estructura del dominio Priority
 * Representa un nivel de prioridad de incidencia en el contexto de negocio
 * Esta interfaz es independiente de la implementación de base de datos
 * y define los niveles de urgencia para la atención de incidencias
 */
export interface Priority {
  id: number;
  nombre: string;
  descripcion?: string;
  nivel: number;
  color?: string;
  estado: number;
  fechaCreacion: Date;
}
