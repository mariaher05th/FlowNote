import { Model } from 'mongoose';
import { CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
export declare class CommentsService {
    private commentModel;
    constructor(commentModel: Model<CommentDocument>);
    crear(dto: CreateCommentDto, userId: string): Promise<CommentDocument>;
    porNota(notaId: string): Promise<CommentDocument[]>;
    actualizar(id: string, dto: UpdateCommentDto, userId: string): Promise<CommentDocument>;
    eliminar(id: string, userId: string): Promise<{
        mensaje: string;
    }>;
}
