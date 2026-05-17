import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  listar(@Request() req) {
    return this.templatesService.listar(req.user.sub);
  }

  @Get(':id')
  obtener(@Param('id') id: string, @Request() req) {
    return this.templatesService.obtener(id, req.user.sub);
  }

  @Post()
  crear(@Body() dto: CreateTemplateDto, @Request() req) {
    return this.templatesService.crear(dto, req.user.sub);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @Request() req) {
    return this.templatesService.actualizar(id, dto, req.user.sub);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    return this.templatesService.eliminar(id, req.user.sub);
  }
}
