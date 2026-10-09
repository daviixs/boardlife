import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnotacoeDto } from './dto/create-anotacoe.dto.js';

@Injectable()
export class AnotacoesService {
  constructor(private readonly prisma: PrismaService) {}

  createAnotacao(dto: CreateAnotacoeDto) {
    return this.prisma.anotacao.create({
      data: {
        name: dto.name.trim(),
        contentAnotation: dto.content_anotation.trim(),
      },
    });
  }

  findAll() {
    try {
    return this.prisma.anotacao.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    } catch (error) {
      throw new NotFoundException('Nenhuma anotação encontrada.');
    }
  }

  search(titulo: string) {
    try {
      return this.prisma.anotacao.findMany({
        where: { name: { contains: titulo.trim() } },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      throw new NotFoundException('Nenhuma anotação encontrada com o título informado.');
    }
  }
}
