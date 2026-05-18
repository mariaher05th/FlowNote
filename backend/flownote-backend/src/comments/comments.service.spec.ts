import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CommentsService } from './comments.service';
import { Comment } from './schemas/comment.schema';
import { createMockModel } from '../../test/helpers/model.mock';

describe('CommentsService', () => {
  let service: CommentsService;
  const commentModel = createMockModel();

  const userId = new Types.ObjectId().toString();
  const otroId = new Types.ObjectId().toString();
  const commentId = new Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getModelToken(Comment.name), useValue: commentModel },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  describe('crear', () => {
    it('guarda comentario con rango de posición', async () => {
      const dto = {
        nota_id: new Types.ObjectId().toString(),
        contenido: 'Comentario inline',
        posicion_inicio: 10,
        posicion_fin: 25,
      };
      commentModel.create.mockResolvedValue({ ...dto, _id: commentId });

      await service.crear(dto, userId);

      expect(commentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          posicion_inicio: 10,
          posicion_fin: 25,
        }),
      );
    });

    it('usa posicion_char como fallback', async () => {
      const dto = {
        nota_id: new Types.ObjectId().toString(),
        contenido: 'Comentario',
        posicion_char: 5,
      };
      commentModel.create.mockResolvedValue({});

      await service.crear(dto, userId);

      expect(commentModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          posicion_inicio: 5,
          posicion_fin: 5,
        }),
      );
    });
  });

  describe('actualizar', () => {
    it('solo el autor puede editar', async () => {
      commentModel.findById.mockResolvedValue({
        usuario_id: { toString: () => otroId },
      });

      await expect(
        service.actualizar(commentId.toString(), { contenido: 'x' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('actualiza contenido del autor', async () => {
      commentModel.findById.mockResolvedValue({
        usuario_id: { toString: () => userId },
      });
      commentModel.findByIdAndUpdate.mockResolvedValue({ contenido: 'editado' });

      const result = await service.actualizar(
        commentId.toString(),
        { contenido: 'editado' },
        userId,
      );

      expect(result.contenido).toBe('editado');
    });
  });

  describe('eliminar', () => {
    it('lanza NotFoundException si no existe', async () => {
      commentModel.findById.mockResolvedValue(null);

      await expect(service.eliminar(commentId.toString(), userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
