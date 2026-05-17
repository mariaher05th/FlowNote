import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)   // Todos los endpoints requieren autenticación
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  // POST /api/notes
  @Post()
  crear(@Body() dto: CreateNoteDto, @Request() req) {
    return this.notesService.crear(dto, req.user.sub);
  }

  // GET /api/notes
  @Get()
  obtenerMias(@Request() req) {
    return this.notesService.obtenerMias(req.user.sub);
  }

  // GET /api/notes/buscar?q=texto
  @Get('buscar')
  buscar(@Query('q') q: string, @Request() req) {
    return this.notesService.buscar(q, req.user.sub);
  }

  // GET /api/notes/estado/:estado
  @Get('estado/:estado')
  porEstado(@Param('estado') estado: string, @Request() req) {
    return this.notesService.porEstado(estado, req.user.sub);
  }

  // GET /api/notes/:id
  @Get(':id')
  obtenerUna(@Param('id') id: string, @Request() req) {
    return this.notesService.obtenerUna(id, req.user.sub);
  }

  // PUT /api/notes/:id
  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateNoteDto, @Request() req) {
    return this.notesService.actualizar(id, dto, req.user.sub);
  }

  // DELETE /api/notes/:id
  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    return this.notesService.eliminar(id, req.user.sub);
  }

  // GET /api/notes/:id/vinculos  → sugerencias de notas relacionadas
  @Get(':id/vinculos')
  sugerirVinculos(@Param('id') id: string, @Request() req) {
    return this.notesService.sugerirVinculos(id, req.user.sub);
  }
}
