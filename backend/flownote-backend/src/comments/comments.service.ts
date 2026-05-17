import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  // Crear comentario en una nota
  async crear(dto: CreateCommentDto, userId: string): Promise<CommentDocument> {
    const inicio = dto.posicion_inicio ?? dto.posicion_char ?? null;
    const fin = dto.posicion_fin ?? dto.posicion_char ?? null;

    return this.commentModel.create({
      usuario_id: new Types.ObjectId(userId),
      nota_id: new Types.ObjectId(dto.nota_id),
      contenido: dto.contenido,
      posicion_char: dto.posicion_char ?? inicio,
      posicion_inicio: inicio,
      posicion_fin: fin,
    });
  }

  // Obtener todos los comentarios de una nota
  async porNota(notaId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ nota_id: new Types.ObjectId(notaId) })
      .populate('usuario_id', 'nombre email')
      .sort({ createdAt: 1 });
  }

  // Editar comentario (solo el autor)
  async actualizar(
    id: string, dto: UpdateCommentDto, userId: string,
  ): Promise<CommentDocument> {
    const comentario = await this.commentModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    if (comentario.usuario_id.toString() !== userId) {
      throw new ForbiddenException('Solo el autor puede editar este comentario');
    }
    return this.commentModel.findByIdAndUpdate(
      id, { contenido: dto.contenido }, { new: true },
    );
  }

  // Eliminar comentario (solo el autor)
  async eliminar(id: string, userId: string): Promise<{ mensaje: string }> {
    const comentario = await this.commentModel.findById(id);
    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    if (comentario.usuario_id.toString() !== userId) {
      throw new ForbiddenException('Solo el autor puede eliminar este comentario');
    }
    await this.commentModel.findByIdAndDelete(id);
    return { mensaje: 'Comentario eliminado correctamente' };
  }
}