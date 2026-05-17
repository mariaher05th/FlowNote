import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto, UpdateWidgetDto, PatchWidgetPositionDto } from './dto/widget.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotesService } from '../notes/notes.service';
import { SpacesService } from '../spaces/spaces.service';

@UseGuards(JwtAuthGuard)
@Controller('widgets')
export class WidgetsController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly notesService: NotesService,
    private readonly spacesService: SpacesService,
  ) {}

  @Post()
  async crear(@Body() dto: CreateWidgetDto, @Request() req) {
    if (dto.nota_id) await this.notesService.obtenerUna(dto.nota_id, req.user.sub);
    if (dto.espacio_id) await this.spacesService.obtenerUno(dto.espacio_id, req.user.sub);
    return this.widgetsService.crear(dto);
  }

  @Get('nota/:notaId')
  async porNota(@Param('notaId') notaId: string, @Request() req) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.widgetsService.porNota(notaId);
  }

  @Get('espacio/:espacioId')
  async porEspacio(@Param('espacioId') espacioId: string, @Request() req) {
    await this.spacesService.obtenerUno(espacioId, req.user.sub);
    return this.widgetsService.porEspacio(espacioId);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateWidgetDto) {
    return this.widgetsService.actualizar(id, dto);
  }

  @Patch(':id/posicion')
  mover(@Param('id') id: string, @Body() dto: PatchWidgetPositionDto) {
    return this.widgetsService.actualizarPosicion(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.widgetsService.eliminar(id);
  }
}
