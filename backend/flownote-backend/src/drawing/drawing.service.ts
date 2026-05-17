import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DrawingLayer, DrawingLayerDocument } from './schemas/drawing.schema';
import { SaveDrawingDto, AddStrokeDto } from './dto/drawing.dto';

@Injectable()
export class DrawingService {
  constructor(
    @InjectModel(DrawingLayer.name) private drawingModel: Model<DrawingLayerDocument>,
  ) {}

  async obtener(notaId: string): Promise<DrawingLayerDocument> {
    let capa = await this.drawingModel.findOne({
      nota_id: new Types.ObjectId(notaId),
    });
    if (!capa) {
      capa = await this.drawingModel.create({
        nota_id: new Types.ObjectId(notaId),
        trazos: [],
        svg_data: '',
      });
    }
    return capa;
  }

  async guardar(notaId: string, dto: SaveDrawingDto): Promise<DrawingLayerDocument> {
    return this.drawingModel.findOneAndUpdate(
      { nota_id: new Types.ObjectId(notaId) },
      {
        trazos: dto.trazos,
        svg_data: dto.svg_data ?? '',
      },
      { upsert: true, new: true },
    );
  }

  async agregarTrazo(notaId: string, dto: AddStrokeDto): Promise<DrawingLayerDocument> {
    const capa = await this.obtener(notaId);
    capa.trazos.push({
      puntos: dto.trazo.puntos.map(p => ({
        x: p.x,
        y: p.y,
        presion: p.presion ?? 1,
      })),
      color: dto.trazo.color ?? '#000000',
      grosor: dto.trazo.grosor ?? 2,
    });
    return capa.save();
  }

  async limpiar(notaId: string): Promise<DrawingLayerDocument> {
    return this.drawingModel.findOneAndUpdate(
      { nota_id: new Types.ObjectId(notaId) },
      { trazos: [], svg_data: '' },
      { upsert: true, new: true },
    );
  }
}
