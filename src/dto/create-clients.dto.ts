import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsEnum(['CC', 'TI', 'TE', 'PP', 'PPT', 'NIT'])
  type_document?: string;

  @IsString()
  number_document: string;

  @IsString()
  @IsOptional()
  rol?: string;

  @IsOptional()
  birth_date?: Date;
}