import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FlowsService } from './flows.service';
import { UpdateFlowDto } from './dto/flow.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { NotesService } from '../notes/notes.service';

@UseGuards(JwtAuthGuard)
@Controller('flows')
export class FlowsController {
  constructor(
    private readonly flowsService: FlowsService,
    private readonly notesService: NotesService,
  ) {}

  @Get('nota/:notaId')
  async obtener(@Param('notaId') notaId: string, @Request() req) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.flowsService.porNota(notaId);
  }

  @Put('nota/:notaId')
  async actualizar(
    @Param('notaId') notaId: string,
    @Body() dto: UpdateFlowDto,
    @Request() req,
  ) {
    await this.notesService.obtenerUna(notaId, req.user.sub);
    return this.flowsService.actualizar(notaId, dto);
  }
}
