import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ExportService } from './export.service';

@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  crear(@Body() dto: CreateNoteDto, @Request() req) {
    return this.notesService.crear(dto, req.user.sub);
  }

  @Get()
  obtenerMias(@Request() req) {
    return this.notesService.obtenerMias(req.user.sub);
  }

  @Get('buscar')
  buscar(@Query('q') q: string, @Request() req) {
    return this.notesService.buscar(q, req.user.sub);
  }

  @Get('kanban')
  tableroKanban(@Query('espacio_id') espacioId: string, @Request() req) {
    return this.notesService.tableroKanban(req.user.sub, espacioId);
  }

  @Get('estado/:estado')
  porEstado(@Param('estado') estado: string, @Request() req) {
    return this.notesService.porEstado(estado, req.user.sub);
  }

  @Get('espacio/:espacioId')
  porEspacio(@Param('espacioId') espacioId: string, @Request() req) {
    return this.notesService.obtenerPorEspacio(espacioId, req.user.sub);
  }

  @Get(':id')
  obtenerUna(@Param('id') id: string, @Request() req) {
    return this.notesService.obtenerUna(id, req.user.sub);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateNoteDto, @Request() req) {
    return this.notesService.actualizar(id, dto, req.user.sub);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    return this.notesService.eliminar(id, req.user.sub);
  }

  @Get(':id/vinculos')
  sugerirVinculos(@Param('id') id: string, @Request() req) {
    return this.notesService.sugerirVinculos(id, req.user.sub);
  }

  @Get(':id/export/pdf')
  async exportarPDF(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const nota = await this.notesService.obtenerUna(id, req.user.sub);
    this.exportService.exportarPDF(nota.titulo, nota.contenido, res);
  }

  @Get(':id/export/markdown')
  async exportarMarkdown(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const nota = await this.notesService.obtenerUna(id, req.user.sub);
    this.exportService.exportarMarkdown(nota.titulo, nota.contenido, res);
  }
}
