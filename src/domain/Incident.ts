/**
 * Interfaz que define la estructura del dominio Incident
 * Representa una incidencia en el contexto de negocio del sistema de gestión
 * Esta interfaz es independiente de la implementación de base de datos
 * y define todos los atributos necesarios para gestionar incidencias de TI
 */
export interface Incident {
  id: number;
  titulo: string;
  descripcion?: string;
  estado: "abierta" | "en_progreso" | "cerrada";
  usuarioId: number;
  soporteId?: number;
  categoriaId: number;
  prioridadId: number;
  creadoEn: Date;
  actualizadoEn: Date;
  usuario?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  soporte?: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  categoria?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  prioridad?: {
    id: number;
    nombre: string;
    nivel: number;
    color?: string;
  };
}
