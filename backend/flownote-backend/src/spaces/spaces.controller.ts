import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/space.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  // POST /api/spaces
  @Post()
  crear(@Body() dto: CreateSpaceDto, @Request() req) {
    return this.spacesService.crear(dto, req.user.sub);
  }

  // GET /api/spaces
  @Get()
  misEspacios(@Request() req) {
    return this.spacesService.misEspacios(req.user.sub);
  }

  // GET /api/spaces/:id
  @Get(':id')
  obtenerUno(@Param('id') id: string, @Request() req) {
    return this.spacesService.obtenerUno(id, req.user.sub);
  }

  // POST /api/spaces/:id/miembros  → invitar miembro
  @Post(':id/miembros')
  invitar(@Param('id') id: string, @Body() dto: InviteMemberDto, @Request() req) {
    return this.spacesService.invitar(id, dto, req.user.sub);
  }

  // PUT /api/spaces/:id/miembros/:miembroId  → cambiar rol
  @Put(':id/miembros/:miembroId')
  cambiarRol(
    @Param('id') id: string,
    @Param('miembroId') miembroId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return this.spacesService.cambiarRol(id, miembroId, dto, req.user.sub);
  }

  // DELETE /api/spaces/:id/miembros/:miembroId  → remover miembro
  @Delete(':id/miembros/:miembroId')
  eliminarMiembro(
    @Param('id') id: string,
    @Param('miembroId') miembroId: string,
    @Request() req,
  ) {
    return this.spacesService.eliminarMiembro(id, miembroId, req.user.sub);
  }
}
