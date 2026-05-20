import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      service: 'FlowNote API',
      status: 'ok',
      api: '/api',
      websocket: '/collaboration',
      hint: 'La app web suele estar en http://localhost:5173',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
