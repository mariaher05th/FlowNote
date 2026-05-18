import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Widget, WidgetDocument } from './schemas/widget.schema';
import { CreateWidgetDto, UpdateWidgetDto, PatchWidgetPositionDto } from './dto/widget.dto';

@Injectable()
export class WidgetsService {
  constructor(@InjectModel(Widget.name) private widgetModel: Model<WidgetDocument>) {}

  async crear(dto: CreateWidgetDto): Promise<WidgetDocument> {
    if (!dto.nota_id && !dto.espacio_id) {
      throw new BadRequestException('Debe indicar nota_id o espacio_id');
    }
    return this.widgetModel.create({
      tipo: dto.tipo,
      config: dto.config ?? {},
      nota_id: dto.nota_id ? new Types.ObjectId(dto.nota_id) : null,
      espacio_id: dto.espacio_id ? new Types.ObjectId(dto.espacio_id) : null,
      x: dto.x ?? 0,
      y: dto.y ?? 0,
      width: dto.width ?? 200,
      height: dto.height ?? 120,
      orden: dto.orden ?? 0,
    });
  }

  async porDashboard(userId: string): Promise<WidgetDocument[]> {
    return this.widgetModel
      .find({ usuario_id: new Types.ObjectId(userId), nota_id: null, espacio_id: null })
      .sort({ orden: 1 });
  }

  async crearDashboard(tipo: string, config: Record<string, unknown>, userId: string): Promise<WidgetDocument> {
    const count = await this.widgetModel.countDocuments({ usuario_id: new Types.ObjectId(userId), nota_id: null, espacio_id: null });
    return this.widgetModel.create({
      usuario_id: new Types.ObjectId(userId),
      tipo,
      config: config ?? {},
      nota_id: null,
      espacio_id: null,
      orden: count,
    });
  }

  async actualizarDashboard(id: string, config: Record<string, unknown>, userId: string): Promise<WidgetDocument> {
    const widget = await this.widgetModel.findById(id);
    if (!widget) throw new NotFoundException('Widget no encontrado');
    if (widget.usuario_id?.toString() !== userId) throw new ForbiddenException();
    return this.widgetModel.findByIdAndUpdate(id, { config }, { new: true });
  }

  async eliminarDashboard(id: string, userId: string): Promise<{ mensaje: string }> {
    const widget = await this.widgetModel.findById(id);
    if (!widget) throw new NotFoundException('Widget no encontrado');
    if (widget.usuario_id?.toString() !== userId) throw new ForbiddenException();
    await this.widgetModel.findByIdAndDelete(id);
    return { mensaje: 'Widget eliminado' };
  }

  async porNota(notaId: string): Promise<WidgetDocument[]> {
    return this.widgetModel
      .find({ nota_id: new Types.ObjectId(notaId) })
      .sort({ orden: 1 });
  }

  async porEspacio(espacioId: string): Promise<WidgetDocument[]> {
    return this.widgetModel
      .find({ espacio_id: new Types.ObjectId(espacioId) })
      .sort({ orden: 1 });
  }

  async actualizar(id: string, dto: UpdateWidgetDto): Promise<WidgetDocument> {
    const widget = await this.widgetModel.findByIdAndUpdate(id, dto, { new: true });
    if (!widget) throw new NotFoundException('Widget no encontrado');
    return widget;
  }

  async actualizarPosicion(id: string, dto: PatchWidgetPositionDto): Promise<WidgetDocument> {
    const widget = await this.widgetModel.findByIdAndUpdate(id, dto, { new: true });
    if (!widget) throw new NotFoundException('Widget no encontrado');
    return widget;
  }

  async eliminar(id: string): Promise<{ mensaje: string }> {
    const widget = await this.widgetModel.findByIdAndDelete(id);
    if (!widget) throw new NotFoundException('Widget no encontrado');
    return { mensaje: 'Widget eliminado correctamente' };
  }
}
