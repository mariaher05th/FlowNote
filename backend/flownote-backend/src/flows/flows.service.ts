import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { FlowDashboard, FlowDashboardDocument } from './schemas/flow.schema';
import { UpdateFlowDto } from './dto/flow.dto';
import { NoteDocument } from '../notes/schemas/note.schema';

@Injectable()
export class FlowsService {
  constructor(
    @InjectModel(FlowDashboard.name) private flowModel: Model<FlowDashboardDocument>,
  ) {}

  async crearDesdeNota(nota: NoteDocument): Promise<FlowDashboardDocument> {
    const existente = await this.flowModel.findOne({ nota_id: nota._id });
    if (existente) return existente;

    const nodoInicio = {
      id: randomUUID(),
      etiqueta: nota.titulo,
      tipo: 'inicio',
      x: 100,
      y: 100,
      estado: nota.estado,
    };

    return this.flowModel.create({
      nota_id: nota._id,
      nodos: [nodoInicio],
      conexiones: [],
    });
  }

  async porNota(notaId: string): Promise<FlowDashboardDocument> {
    const dashboard = await this.flowModel.findOne({
      nota_id: new Types.ObjectId(notaId),
    });
    if (!dashboard) throw new NotFoundException('Dashboard de flujo no encontrado');
    return dashboard;
  }

  async actualizar(notaId: string, dto: UpdateFlowDto): Promise<FlowDashboardDocument> {
    const dashboard = await this.porNota(notaId);
    if (dto.nodos !== undefined) dashboard.nodos = dto.nodos as any;
    if (dto.conexiones !== undefined) dashboard.conexiones = dto.conexiones as any;
    return dashboard.save();
  }
}
