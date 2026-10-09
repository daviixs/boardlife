import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AnotacoesModule } from './anotacoes/anotacoes.module.js';

@Module({
  imports: [PrismaModule, AnotacoesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
