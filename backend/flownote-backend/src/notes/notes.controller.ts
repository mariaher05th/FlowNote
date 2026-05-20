import {
  Controller, Get, Post, Put, Patch, Delete,
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

  private ctx(req: { user: { sub: string; username?: string } }) {
    return { userId: req.user.sub, username: req.user.username };
  }

  @Post()
  crear(@Body() dto: CreateNoteDto, @Request() req) {
    return this.notesService.crear(dto, req.user.sub);
  }

  @Get()
  obtenerMias(@Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.obtenerMias(userId, username);
  }

  @Get('invitaciones')
  obtenerInvitaciones(@Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.obtenerInvitaciones(userId, username);
  }

  @Patch(':id/invitacion')
  responderInvitacion(@Param('id') id: string, @Body() body: { respuesta: 'aceptada' | 'rechazada' }, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.responderInvitacion(id, userId, username, body.respuesta);
  }

  @Post(':id/colaboradores')
  agregarColaborador(@Param('id') id: string, @Body() body: { usuario_id: string; username: string; nombre: string; rol: string }, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.agregarColaborador(id, userId, username, body);
  }

  @Patch(':id/colaboradores/:targetUsername/rol')
  cambiarRol(@Param('id') id: string, @Param('targetUsername') target: string, @Body() body: { rol: string }, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.cambiarRolColaborador(id, userId, username, target, body.rol);
  }

  @Delete(':id/colaboradores/:targetUsername')
  eliminarColaborador(@Param('id') id: string, @Param('targetUsername') target: string, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.eliminarColaborador(id, userId, username, target);
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
    const { userId, username } = this.ctx(req);
    return this.notesService.obtenerUna(id, userId, username);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateNoteDto, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.actualizar(id, dto, userId, username);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.eliminar(id, userId, username);
  }

  @Get(':id/vinculos')
  sugerirVinculos(@Param('id') id: string, @Request() req) {
    const { userId, username } = this.ctx(req);
    return this.notesService.sugerirVinculos(id, userId, username);
  }

  @Get(':id/export/pdf')
  async exportarPDF(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const { userId, username } = this.ctx(req);
    const nota = await this.notesService.obtenerUna(id, userId, username);
    this.exportService.exportarPDF(nota.titulo, nota.contenido, res);
  }

  @Get(':id/export/markdown')
  async exportarMarkdown(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const { userId, username } = this.ctx(req);
    const nota = await this.notesService.obtenerUna(id, userId, username);
    this.exportService.exportarMarkdown(nota.titulo, nota.contenido, res);
  }
}
