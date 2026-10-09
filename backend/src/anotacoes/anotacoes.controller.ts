import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AnotacoesService } from './anotacoes.service.js';
import { CreateAnotacoeDto } from './dto/create-anotacoe.dto.js';

@Controller('anotacoes')
export class AnotacoesController {
  constructor(private readonly anotacoesService: AnotacoesService) {}

  @Post('criar-anotacao')
  create(@Body() createAnotacoeDto: CreateAnotacoeDto) {
    return this.anotacoesService.createAnotacao(createAnotacoeDto);
  }

  @Get('buscar-todas')
  findAll() {
    return this.anotacoesService.findAll();
  }

  @Get('buscar')
  search(@Query('titulo') titulo: string) {
    return this.anotacoesService.search(titulo);
  }
}
