import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnotacoeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content_anotation!: string;
}
