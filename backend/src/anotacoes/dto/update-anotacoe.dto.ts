import { PartialType } from '@nestjs/mapped-types';
import { CreateAnotacoeDto } from './create-anotacoe.dto.js';

export class UpdateAnotacoeDto extends PartialType(CreateAnotacoeDto) {}
