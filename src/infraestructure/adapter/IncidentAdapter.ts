// infrastructure/adapter/IncidentAdapter.ts
import { Repository } from "typeorm";
import { Incident as IncidentDomain } from "../../domain/Incident";
import { IncidentPort } from "../../domain/IncidentPort";
import { Incident as IncidentEntity } from "../entities/Incident";
import { AppDataSource } from "../config/data-base";

/**
 * Adaptador que implementa la persistencia de incidencias usando TypeORM
 * Implementa el patrón Adapter de la arquitectura hexagonal
 *
 * Responsabilidades:
 * - Traducir entre objetos de dominio y entidades de base de datos
 * - Implementar todas las operaciones definidas en IncidentPort
 * - Manejar la persistencia específica de MySQL con relaciones
 * - Gestionar errores de infraestructura
 * - Realizar consultas complejas con filtros y joins
 */
export class IncidentAdapter implements IncidentPort {
  private incidentRepository: Repository<IncidentEntity>;
    port: any;

  /**
   * Constructor que inicializa el repositorio de TypeORM
   * Obtiene la instancia del repositorio desde la fuente de datos configurada
   */
  constructor() {
    this.incidentRepository = AppDataSource.getRepository(IncidentEntity);
  }

  /**
   * Convierte una entidad de base de datos a objeto de dominio
   * @param entity - Entidad de base de datos
   * @param includeRelations - Si incluir datos de entidades relacionadas
   * @returns IncidentDomain - Objeto de dominio
   */
  private toDomain(
    entity: IncidentEntity,
    includeRelations: boolean = false
  ): IncidentDomain {
    const incident: IncidentDomain = {
      id: entity.id_incidencias,
      titulo: entity.titulo,
      descripcion: entity.descripcion,
      estado: entity.estado,
      usuarioId: entity.usuario_id,
      soporteId: entity.soporte_id ?? undefined,
      categoriaId: entity.categoria_id,
      prioridadId: entity.prioridad_id,
      creadoEn: entity.creado_en,
      actualizadoEn: entity.actualizado_en,
    };

    // Incluir datos relacionados si se solicita y están disponibles
    if (includeRelations) {
      if (entity.usuario) {
        incident.usuario = {
          id: entity.usuario.id_usuarios,
          nombre: entity.usuario.nombre,
          email: entity.usuario.email,
          rol: entity.usuario.rol,
        };
      }

      if (entity.soporte) {
        incident.soporte = {
          id: entity.soporte.id_usuarios,
          nombre: entity.soporte.nombre,
          email: entity.soporte.email,
          rol: entity.soporte.rol,
        };
      }

      if (entity.categoria) {
        incident.categoria = {
          id: entity.categoria.id_categorias,
          nombre: entity.categoria.nombre,
          descripcion: entity.categoria.descripcion,
        };
      }

      if (entity.prioridad) {
        incident.prioridad = {
          id: entity.prioridad.id_prioridad,
          nombre: entity.prioridad.nombre_prioridad,
          nivel: entity.prioridad.nivel_prioridad,
          color: entity.prioridad.color_prioridad,
        };
      }
    }

    return incident;
  }

  /**
   * Convierte un objeto de dominio a entidad de base de datos
   * @param incident - Objeto de dominio sin ID y fechas
   * @returns IncidentEntity - Entidad de base de datos
   */
  private toEntity(
    incident: Omit<IncidentDomain, "id" | "creadoEn" | "actualizadoEn">
  ): IncidentEntity {
    const incidentEntity = new IncidentEntity();
    incidentEntity.titulo = incident.titulo;
    incidentEntity.descripcion = incident.descripcion;
    incidentEntity.estado = incident.estado || "abierta";
    incidentEntity.usuario_id = incident.usuarioId;
    incidentEntity.soporte_id = incident.soporteId;
    incidentEntity.categoria_id = incident.categoriaId;
    incidentEntity.prioridad_id = incident.prioridadId;
    return incidentEntity;
  }

  /**
   * Crea una nueva incidencia en la base de datos
   * @param incident - Datos de la incidencia a crear
   * @returns Promise<number> - ID de la incidencia creada
   * @throws Error si falla la operación de creación
   */
  async createIncident(
    incident: Omit<IncidentDomain, "id" | "creadoEn" | "actualizadoEn">
  ): Promise<number> {
    try {
      const newIncident = this.toEntity(incident);
      const savedIncident = await this.incidentRepository.save(newIncident);
      return savedIncident.id_incidencias;
    } catch (error) {
      console.error("Error creating incident:", error);
      throw new Error("Error al crear la incidencia en la base de datos");
    }
  }

  /**
   * Obtiene una incidencia por su ID con opción de incluir relaciones
   * @param id - Identificador de la incidencia
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain | null> - Incidencia encontrada o null
   * @throws Error si falla la consulta
   */
  async getIncidentById(
    id: number,
    includeRelations: boolean = false
  ): Promise<IncidentDomain | null> {
    try {
      const queryBuilder =
        this.incidentRepository.createQueryBuilder("incident");

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      const incident = await queryBuilder
        .where("incident.id_incidencias = :id", { id })
        .getOne();

      return incident ? this.toDomain(incident, includeRelations) : null;
    } catch (error) {
      console.error("Error fetching incident by ID:", error);
      throw new Error("Error al obtener la incidencia por ID");
    }
  }

  /**
   * Obtiene todas las incidencias con filtros opcionales
   * @param filters - Filtros para la búsqueda
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain[]> - Array de incidencias
   * @throws Error si falla la consulta
   */
  async getAllIncidents(
    filters?: {
      estado?: "abierta" | "en_progreso" | "cerrada";
      usuarioId?: number;
      soporteId?: number;
      categoriaId?: number;
      prioridadId?: number;
      fechaDesde?: Date;
      fechaHasta?: Date;
    },
    includeRelations: boolean = false
  ): Promise<IncidentDomain[]> {
    try {
      const queryBuilder =
        this.incidentRepository.createQueryBuilder("incident");

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      // Aplicar filtros si se proporcionan
      if (filters) {
        if (filters.estado) {
          queryBuilder.andWhere("incident.estado = :estado", {
            estado: filters.estado,
          });
        }

        if (filters.usuarioId) {
          queryBuilder.andWhere("incident.usuario_id = :usuarioId", {
            usuarioId: filters.usuarioId,
          });
        }

        if (filters.soporteId) {
          queryBuilder.andWhere("incident.soporte_id = :soporteId", {
            soporteId: filters.soporteId,
          });
        }

        if (filters.categoriaId) {
          queryBuilder.andWhere("incident.categoria_id = :categoriaId", {
            categoriaId: filters.categoriaId,
          });
        }

        if (filters.prioridadId) {
          queryBuilder.andWhere("incident.prioridad_id = :prioridadId", {
            prioridadId: filters.prioridadId,
          });
        }

        if (filters.fechaDesde) {
          queryBuilder.andWhere("incident.creado_en >= :fechaDesde", {
            fechaDesde: filters.fechaDesde,
          });
        }

        if (filters.fechaHasta) {
          queryBuilder.andWhere("incident.creado_en <= :fechaHasta", {
            fechaHasta: filters.fechaHasta,
          });
        }
      }

      // Ordenar por fecha de creación (más recientes primero)
      queryBuilder.orderBy("incident.creado_en", "DESC");

      const incidents = await queryBuilder.getMany();
      return incidents.map((incident) =>
        this.toDomain(incident, includeRelations)
      );
    } catch (error) {
      console.error("Error fetching all incidents:", error);
      throw new Error("Error al obtener todas las incidencias");
    }
  }

  /**
   * Obtiene incidencias asignadas a un técnico específico
   * @param soporteId - ID del técnico de soporte
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain[]> - Array de incidencias asignadas
   */
  async getIncidentsBySupport(
    soporteId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<IncidentDomain[]> {
    try {
      const queryBuilder = this.incidentRepository
        .createQueryBuilder("incident")
        .where("incident.soporte_id = :soporteId", { soporteId });

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      if (estado) {
        queryBuilder.andWhere("incident.estado = :estado", { estado });
      }

      queryBuilder.orderBy("incident.creado_en", "DESC");

      const incidents = await queryBuilder.getMany();
      return incidents.map((incident) =>
        this.toDomain(incident, includeRelations)
      );
    } catch (error) {
      console.error("Error fetching incidents by support:", error);
      throw new Error(
        "Error al obtener las incidencias por técnico de soporte"
      );
    }
  }

  /**
   * Obtiene incidencias reportadas por un usuario específico
   * @param usuarioId - ID del usuario que reportó
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain[]> - Array de incidencias del usuario
   */
  async getIncidentsByUser(
    usuarioId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<IncidentDomain[]> {
    try {
      const queryBuilder = this.incidentRepository
        .createQueryBuilder("incident")
        .where("incident.usuario_id = :usuarioId", { usuarioId });

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      if (estado) {
        queryBuilder.andWhere("incident.estado = :estado", { estado });
      }

      queryBuilder.orderBy("incident.creado_en", "DESC");

      const incidents = await queryBuilder.getMany();
      return incidents.map((incident) =>
        this.toDomain(incident, includeRelations)
      );
    } catch (error) {
      console.error("Error fetching incidents by user:", error);
      throw new Error("Error al obtener las incidencias por usuario");
    }
  }

  /**
   * Obtiene incidencias por categoría
   * @param categoriaId - ID de la categoría
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain[]> - Array de incidencias de la categoría
   */
  async getIncidentsByCategory(
    categoriaId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<IncidentDomain[]> {
    try {
      const queryBuilder = this.incidentRepository
        .createQueryBuilder("incident")
        .where("incident.categoria_id = :categoriaId", { categoriaId });

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      if (estado) {
        queryBuilder.andWhere("incident.estado = :estado", { estado });
      }

      queryBuilder.orderBy("incident.creado_en", "DESC");

      const incidents = await queryBuilder.getMany();
      return incidents.map((incident) =>
        this.toDomain(incident, includeRelations)
      );
    } catch (error) {
      console.error("Error fetching incidents by category:", error);
      throw new Error("Error al obtener las incidencias por categoría");
    }
  }

  /**
   * Obtiene incidencias por nivel de prioridad
   * @param prioridadId - ID de la prioridad
   * @param estado - Filtro opcional por estado
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise<IncidentDomain[]> - Array de incidencias con la prioridad
   */
  async getIncidentsByPriority(
    prioridadId: number,
    estado?: "abierta" | "en_progreso" | "cerrada",
    includeRelations: boolean = false
  ): Promise<IncidentDomain[]> {
    try {
      const queryBuilder = this.incidentRepository
        .createQueryBuilder("incident")
        .where("incident.prioridad_id = :prioridadId", { prioridadId });

      if (includeRelations) {
        queryBuilder
          .leftJoinAndSelect("incident.usuario", "usuario")
          .leftJoinAndSelect("incident.soporte", "soporte")
          .leftJoinAndSelect("incident.categoria", "categoria")
          .leftJoinAndSelect("incident.prioridad", "prioridad");
      }

      if (estado) {
        queryBuilder.andWhere("incident.estado = :estado", { estado });
      }

      queryBuilder.orderBy("incident.creado_en", "DESC");

      const incidents = await queryBuilder.getMany();
      return incidents.map((incident) =>
        this.toDomain(incident, includeRelations)
      );
    } catch (error) {
      console.error("Error fetching incidents by priority:", error);
      throw new Error("Error al obtener las incidencias por prioridad");
    }
  }

  /**
   * Actualiza una incidencia existente
   * @param id - Identificador de la incidencia
   * @param incident - Datos parciales a actualizar
   * @returns Promise<boolean> - true si se actualizó correctamente
   * @throws Error si falla la actualización
   */
  async updateIncident(
    id: number,
    incident: Partial<Omit<IncidentDomain, "id" | "creadoEn">>
  ): Promise<boolean> {
    try {
      const existingIncident = await this.incidentRepository.findOne({
        where: { id_incidencias: id },
      });

      if (!existingIncident) {
        return false;
      }

      // Crear objeto con los campos a actualizar
      const updatedFields: any = {};

      if (incident.titulo !== undefined) updatedFields.titulo = incident.titulo;
      if (incident.descripcion !== undefined)
        updatedFields.descripcion = incident.descripcion;
      if (incident.estado !== undefined) updatedFields.estado = incident.estado;
      if (incident.soporteId !== undefined)
        updatedFields.soporte_id = incident.soporteId;
      if (incident.categoriaId !== undefined)
        updatedFields.categoria_id = incident.categoriaId;
      if (incident.prioridadId !== undefined)
        updatedFields.prioridad_id = incident.prioridadId;

      // Verificar que hay campos para actualizar
      if (Object.keys(updatedFields).length === 0) {
        return true; // No hay cambios, pero es exitoso
      }

      const updateResult = await this.incidentRepository.update(
        { id_incidencias: id },
        updatedFields
      );

      return updateResult.affected !== undefined && updateResult.affected > 0;
    } catch (error) {
      console.error("Error updating incident:", error);
      throw new Error("Error al actualizar la incidencia");
    }
  }

  /**
   * Cambia el estado de una incidencia
   * @param id - Identificador de la incidencia
   * @param estado - Nuevo estado
   * @returns Promise<boolean> - true si se cambió correctamente
   */
  async changeIncidentStatus(
    id: number,
    estado: "abierta" | "en_progreso" | "cerrada"
  ): Promise<boolean> {
    try {
      const updateResult = await this.incidentRepository.update(
        { id_incidencias: id },
        { estado }
      );

      return updateResult.affected !== undefined && updateResult.affected > 0;
    } catch (error) {
      console.error("Error changing incident status:", error);
      throw new Error("Error al cambiar el estado de la incidencia");
    }
  }

  /**
   * Asigna una incidencia a un técnico de soporte
   * @param id - Identificador de la incidencia
   * @param soporteId - ID del técnico (null para desasignar)
   * @returns Promise<boolean> - true si se asignó correctamente
   */
  async assignIncident(id: number, soporteId: number | null): Promise<boolean> {
    try {
      const updateResult = await this.incidentRepository.update(
        { id_incidencias: id },
        { soporte_id: soporteId }
      );

      return updateResult.affected !== undefined && updateResult.affected > 0;
    } catch (error) {
      console.error("Error assigning incident:", error);
      throw new Error("Error al asignar la incidencia");
    }
  }

  /**
   * Elimina una incidencia del sistema (eliminación física)
   * @param id - Identificador de la incidencia
   * @returns Promise<boolean> - true si se eliminó correctamente
   * @throws Error si la incidencia no existe
   */
  async deleteIncident(id: number): Promise<boolean> {
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }

    // Nota: Aquí se podría agregar validación para verificar si la incidencia
    // tiene comentarios antes de eliminarla
    
    return await this.port.deleteIncident(id);
  }

  /**
   * Obtiene estadísticas de incidencias
   * @param filters - Filtros opcionales
   * @returns Promise<object> - Estadísticas calculadas
   */
  async getIncidentStatistics(filters?: {
    fechaDesde?: Date;
    fechaHasta?: Date;
    usuarioId?: number;
    categoriaId?: number;
  }): Promise<{
    total: number;
    abiertas: number;
    enProgreso: number;
    cerradas: number;
    porCategoria: { [key: string]: number };
    porPrioridad: { [key: string]: number };
    tiempoPromedioResolucion?: number;
  }> {
    try {
      const queryBuilder = this.incidentRepository
        .createQueryBuilder("incident")
        .leftJoin("incident.categoria", "categoria")
        .leftJoin("incident.prioridad", "prioridad");

      // Aplicar filtros
      if (filters) {
        if (filters.fechaDesde) {
          queryBuilder.andWhere("incident.creado_en >= :fechaDesde", {
            fechaDesde: filters.fechaDesde,
          });
        }
        if (filters.fechaHasta) {
          queryBuilder.andWhere("incident.creado_en <= :fechaHasta", {
            fechaHasta: filters.fechaHasta,
          });
        }
        if (filters.usuarioId) {
          queryBuilder.andWhere("incident.usuario_id = :usuarioId", {
            usuarioId: filters.usuarioId,
          });
        }
        if (filters.categoriaId) {
          queryBuilder.andWhere("incident.categoria_id = :categoriaId", {
            categoriaId: filters.categoriaId,
          });
        }
      }

      // Obtener datos básicos
      const incidents = await queryBuilder
        .select([
          "incident.estado",
          "categoria.nombre_categoria",
          "prioridad.nombre_prioridad",
          "incident.creado_en",
          "incident.actualizado_en",
        ])
        .getRawMany();

      // Calcular estadísticas
      const total = incidents.length;
      const abiertas = incidents.filter(
        (i) => i.incident_estado === "abierta"
      ).length;
      const enProgreso = incidents.filter(
        (i) => i.incident_estado === "en_progreso"
      ).length;
      const cerradas = incidents.filter(
        (i) => i.incident_estado === "cerrada"
      ).length;

      // Estadísticas por categoría
      const porCategoria: { [key: string]: number } = {};
      incidents.forEach((i) => {
        const categoria = i.categoria_nombre_categoria || "Sin categoría";
        porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
      });

      // Estadísticas por prioridad
      const porPrioridad: { [key: string]: number } = {};
      incidents.forEach((i) => {
        const prioridad = i.prioridad_nombre_prioridad || "Sin prioridad";
        porPrioridad[prioridad] = (porPrioridad[prioridad] || 0) + 1;
      });

      // Calcular tiempo promedio de resolución (solo para incidencias cerradas)
      const incidenciasCerradas = incidents.filter(
        (i) =>
          i.incident_estado === "cerrada" &&
          i.incident_creado_en &&
          i.incident_actualizado_en
      );

      let tiempoPromedioResolucion: number | undefined;
      if (incidenciasCerradas.length > 0) {
        const tiemposTotales = incidenciasCerradas.map((i) => {
          const creado = new Date(i.incident_creado_en);
          const actualizado = new Date(i.incident_actualizado_en);
          return (actualizado.getTime() - creado.getTime()) / (1000 * 60 * 60); // en horas
        });

        tiempoPromedioResolucion =
          tiemposTotales.reduce((sum, tiempo) => sum + tiempo, 0) /
          tiemposTotales.length;
      }

      return {
        total,
        abiertas,
        enProgreso,
        cerradas,
        porCategoria,
        porPrioridad,
        tiempoPromedioResolucion,
      };
    } catch (error) {
      console.error("Error getting incident statistics:", error);
      throw new Error("Error al obtener estadísticas de incidencias");
    }
  }
}
