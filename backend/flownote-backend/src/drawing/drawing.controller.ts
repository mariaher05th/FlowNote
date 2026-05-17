import {
  Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { DrawingService } from './drawing.service';
import { SaveDrawingDto, AddStrokeDto } from './dto/drawing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotesService } from '../notes/notes.service';

@UseGuards(JwtAuthGuard)
@Controller('drawing')
export class DrawingController {
  constructor(
    private readonly drawingService: DrawingService,
    private readonly notesService: NotesService,
  ) {}

  @Get('nota/:notaId')
  async obtener(@Param('notaId') notaId: string, @Request() req) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.drawingService.obtener(notaId);
  }

  @Put('nota/:notaId')
  async guardar(
    @Param('notaId') notaId: string,
    @Body() dto: SaveDrawingDto,
    @Request() req,
  ) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.drawingService.guardar(notaId, dto);
  }

  @Post('nota/:notaId/trazo')
  async agregarTrazo(
    @Param('notaId') notaId: string,
    @Body() dto: AddStrokeDto,
    @Request() req,
  ) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.drawingService.agregarTrazo(notaId, dto);
  }

  @Delete('nota/:notaId')
  async limpiar(@Param('notaId') notaId: string, @Request() req) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.drawingService.limpiar(notaId);
  }
}
