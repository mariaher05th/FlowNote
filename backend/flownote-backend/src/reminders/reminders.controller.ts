import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/reminder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  // POST /api/reminders
  @Post()
  crear(@Body() dto: CreateReminderDto, @Request() req) {
    return this.remindersService.crear(dto, req.user.sub);
  }

  // GET /api/reminders
  @Get()
  misRecordatorios(@Request() req) {
    return this.remindersService.misRecordatorios(req.user.sub);
  }

  // GET /api/reminders/proximos  → próximas 24 horas
  @Get('proximos')
  proximos(@Request() req) {
    return this.remindersService.proximos(req.user.sub);
  }

  // GET /api/reminders/nota/:notaId  → recordatorios de una nota
  @Get('nota/:notaId')
  porNota(@Param('notaId') notaId: string, @Request() req) {
    return this.remindersService.porNota(notaId, req.user.sub);
  }

  // PUT /api/reminders/:id
  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateReminderDto, @Request() req) {
    return this.remindersService.actualizar(id, dto, req.user.sub);
  }

  // DELETE /api/reminders/:id
  @Delete(':id')
  eliminar(@Param('id') id: string, @Request() req) {
    return this.remindersService.eliminar(id, req.user.sub);
  }
}