import { Module } from '@nestjs/common';
import { AnotacoesService } from './anotacoes.service.js';
import { AnotacoesController } from './anotacoes.controller.js';

@Module({
  controllers: [AnotacoesController],
  providers: [AnotacoesService],
})
export class AnotacoesModule {}
