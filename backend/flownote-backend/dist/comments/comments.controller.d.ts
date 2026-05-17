import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    crear(dto: CreateCommentDto, req: any): Promise<import("./schemas/comment.schema").CommentDocument>;
    porNota(notaId: string): Promise<import("./schemas/comment.schema").CommentDocument[]>;
    actualizar(id: string, dto: UpdateCommentDto, req: any): Promise<import("./schemas/comment.schema").CommentDocument>;
    eliminar(id: string, req: any): Promise<{
        mensaje: string;
    }>;
}
