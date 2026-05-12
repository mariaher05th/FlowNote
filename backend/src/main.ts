import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  
  // Swagger settup for API documentation
  const config = new DocumentBuilder()
    .setTitle('FlowNote API')
    .setDescription('API documentation for FlowNote application')
    .setVersion('1.0')
    .addTag('flownote')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
