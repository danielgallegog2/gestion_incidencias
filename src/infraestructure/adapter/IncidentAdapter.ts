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

  constructor() {
    this.incidentRepository = AppDataSource.getRepository(IncidentEntity);
  }

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

      if (Object.keys(updatedFields).length === 0) {
        return true;
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

  async deleteIncident(id: number): Promise<boolean> {
    const existingIncident = await this.port.getIncidentById(id);
    if (!existingIncident) {
      throw new Error("Incidencia no encontrada");
    }
    return await this.port.deleteIncident(id);
  }

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
      console.log("Iniciando getIncidentStatistics con filtros:", filters);

      let whereConditions = "1 = 1";
      const queryParams: any = {};

      if (filters) {
        if (filters.fechaDesde) {
          whereConditions += " AND incident.creado_en >= :fechaDesde";
          queryParams.fechaDesde = filters.fechaDesde;
        }
        if (filters.fechaHasta) {
          whereConditions += " AND incident.creado_en <= :fechaHasta";
          queryParams.fechaHasta = filters.fechaHasta;
        }
        if (filters.usuarioId) {
          whereConditions += " AND incident.usuario_id = :usuarioId";
          queryParams.usuarioId = filters.usuarioId;
        }
        if (filters.categoriaId) {
          whereConditions += " AND incident.categoria_id = :categoriaId";
          queryParams.categoriaId = filters.categoriaId;
        }
      }

      // 1. Estadísticas básicas por estado
      const basicStatsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'abierta' THEN 1 ELSE 0 END) as abiertas,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as enProgreso,
        SUM(CASE WHEN estado = 'cerrada' THEN 1 ELSE 0 END) as cerradas
      FROM incidencias incident
      WHERE ${whereConditions}
    `;

      const basicStats = await this.incidentRepository.manager.query(
        basicStatsQuery,
        queryParams
      );
      console.log("Basic stats result:", basicStats);

      const stats = basicStats[0];
      const total = parseInt(stats.total) || 0;
      const abiertas = parseInt(stats.abiertas) || 0;
      const enProgreso = parseInt(stats.enProgreso) || 0;
      const cerradas = parseInt(stats.cerradas) || 0;

      // 2. Estadísticas por categoría
      const categoryStatsQuery = `
      SELECT 
        c.nombre as categoria_nombre,
        COUNT(incident.id_incidencias) as cantidad
      FROM incidencias incident
      LEFT JOIN categorias c ON incident.categoria_id = c.id_categorias
      WHERE ${whereConditions}
      GROUP BY incident.categoria_id, c.nombre
      ORDER BY cantidad DESC
    `;

      const categoryStats = await this.incidentRepository.manager.query(
        categoryStatsQuery,
        queryParams
      );
      console.log("Category stats result:", categoryStats);

      const porCategoria: { [key: string]: number } = {};
      categoryStats.forEach((stat: any) => {
        const categoria = stat.categoria_nombre || "Sin categoría";
        porCategoria[categoria] = parseInt(stat.cantidad) || 0;
      });

      // 3. Estadísticas por prioridad
      const priorityStatsQuery = `
      SELECT 
        p.nombre_prioridad as prioridad_nombre,
        COUNT(incident.id_incidencias) as cantidad
      FROM incidencias incident
      LEFT JOIN prioridades p ON incident.prioridad_id = p.id_prioridad
      WHERE ${whereConditions}
      GROUP BY incident.prioridad_id, p.nombre_prioridad
      ORDER BY cantidad DESC
    `;

      const priorityStats = await this.incidentRepository.manager.query(
        priorityStatsQuery,
        queryParams
      );
      console.log("Priority stats result:", priorityStats);

      const porPrioridad: { [key: string]: number } = {};
      priorityStats.forEach((stat: any) => {
        const prioridad = stat.prioridad_nombre || "Sin prioridad";
        porPrioridad[prioridad] = parseInt(stat.cantidad) || 0;
      });

      // 4. Tiempo promedio de resolución (solo para incidencias cerradas)
      let tiempoPromedioResolucion: number | undefined;
      if (cerradas > 0) {
        const resolutionTimeQuery = `
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, creado_en, actualizado_en)) as promedio_horas
        FROM incidencias incident
        WHERE estado = 'cerrada' AND ${whereConditions}
      `;

        const resolutionResult = await this.incidentRepository.manager.query(
          resolutionTimeQuery,
          queryParams
        );
        console.log("Resolution time result:", resolutionResult);

        if (
          resolutionResult[0] &&
          resolutionResult[0].promedio_horas !== null
        ) {
          tiempoPromedioResolucion = parseFloat(
            resolutionResult[0].promedio_horas
          );
        }
      }

      const finalResult = {
        total,
        abiertas,
        enProgreso,
        cerradas,
        porCategoria,
        porPrioridad,
        tiempoPromedioResolucion,
      };

      console.log("Final statistics result:", finalResult);
      return finalResult;
    } catch (error) {
      console.error("Error generating incident statistics:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      throw new Error("Error al obtener estadísticas de incidencias");
    }
  }
}
