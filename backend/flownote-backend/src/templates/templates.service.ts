import { Injectable, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

const PLANTILLAS_SISTEMA = [
  {
    titulo: 'Reunión',
    contenido: '# Reunión\n\n**Fecha:**\n**Asistentes:**\n\n## Agenda\n1. \n\n## Notas\n',
    categoria: 'reunion',
  },
  {
    titulo: 'Tarea',
    contenido: '# Tarea\n\n**Prioridad:**\n**Fecha límite:**\n\n## Descripción\n\n## Checklist\n- [ ] ',
    categoria: 'tarea',
  },
  {
    titulo: 'Proyecto',
    contenido: '# Proyecto\n\n## Objetivo\n\n## Fases\n- Pendiente\n- En progreso\n- Completado\n',
    categoria: 'proyecto',
  },
  {
    titulo: 'Diario',
    contenido: '# Diario\n\n## Hoy\n\n## Pendientes\n\n## Reflexiones\n',
    categoria: 'personal',
  },
];

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.templateModel.countDocuments({ es_sistema: true });
    if (count === 0) {
      await this.templateModel.insertMany(
        PLANTILLAS_SISTEMA.map(p => ({ ...p, es_sistema: true, autor_id: null })),
      );
    }
  }

  async listar(userId: string): Promise<TemplateDocument[]> {
    return this.templateModel.find({
      $or: [
        { es_sistema: true },
        { autor_id: new Types.ObjectId(userId) },
      ],
    }).sort({ categoria: 1, titulo: 1 });
  }

  async obtener(id: string, userId: string): Promise<TemplateDocument> {
    const plantilla = await this.templateModel.findById(id);
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada');
    if (
      !plantilla.es_sistema &&
      plantilla.autor_id?.toString() !== userId
    ) {
      throw new ForbiddenException('No tienes acceso a esta plantilla');
    }
    return plantilla;
  }

  async crear(dto: CreateTemplateDto, userId: string): Promise<TemplateDocument> {
    return this.templateModel.create({
      ...dto,
      autor_id: new Types.ObjectId(userId),
      es_sistema: false,
    });
  }

  async actualizar(
    id: string, dto: UpdateTemplateDto, userId: string,
  ): Promise<TemplateDocument> {
    const plantilla = await this.templateModel.findById(id);
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada');
    if (plantilla.es_sistema) {
      throw new ForbiddenException('No se pueden editar plantillas del sistema');
    }
    if (plantilla.autor_id?.toString() !== userId) {
      throw new ForbiddenException('No puedes editar esta plantilla');
    }
    return this.templateModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async eliminar(id: string, userId: string): Promise<{ mensaje: string }> {
    const plantilla = await this.templateModel.findById(id);
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada');
    if (plantilla.es_sistema) {
      throw new ForbiddenException('No se pueden eliminar plantillas del sistema');
    }
    if (plantilla.autor_id?.toString() !== userId) {
      throw new ForbiddenException('No puedes eliminar esta plantilla');
    }
    await this.templateModel.findByIdAndDelete(id);
    return { mensaje: 'Plantilla eliminada correctamente' };
  }
}
