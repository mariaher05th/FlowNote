import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, UpdateThemeDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /api/auth/perfil  (requiere token)
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(@Request() req) {
    return this.authService.perfil(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('tema')
  actualizarTema(@Body() dto: UpdateThemeDto, @Request() req) {
    return this.authService.actualizarTema(req.user.sub, dto);
  }
}
