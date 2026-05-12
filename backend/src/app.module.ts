import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SampleModule } from './sample/sample.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [SampleModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
