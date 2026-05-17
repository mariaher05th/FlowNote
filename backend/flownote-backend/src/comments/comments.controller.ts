import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // POST /api/comments
  @Post()
  crear(@Body() dto: CreateCommentDto, @Request() req) {
    return this.commentsService.crear(dto, req.user.sub);
  }

  // GET /api/comments/nota/:notaId  → comentarios de una nota
  @Get('nota/:notaId')
  porNota(@Param('notaId') notaId: string) {
    return this.commentsService.porNota(notaId);
  }

  // PUT /api/comments/:id
  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateCommentDto, @Request() req) {
    return this.commentsService.actualizar(id, dto, req.user.sub);
  }

  // DELETE /api/comments/:id
  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    return this.commentsService.eliminar(id, req.user.sub);
  }
}