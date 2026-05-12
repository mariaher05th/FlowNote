import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Opcional: si quieres usarlo globalmente sin importar en cada módulo
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}