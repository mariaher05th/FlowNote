import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));
  app.useWebSocketAdapter(new IoAdapter(app));

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: '*', // en producción poner la URL del frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // Validación automática de DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`FlowNote backend corriendo en http://localhost:${port}/api`);
}
bootstrap();
