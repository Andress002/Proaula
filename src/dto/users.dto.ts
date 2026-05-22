import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  last_name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(['admin', 'user'])
  rol: string;

  @IsEnum(['CC', 'TI', 'TE', 'PP', 'PPT', 'NIT'])
  type_document: string;

  @IsString()
  number_document: string;

  @IsString()
  phone: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsOptional()
  has_premium_service?: boolean;

  @IsOptional()
  has_vip_service?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['admin', 'user'])
  rol?: string;

  @IsOptional()
  @IsEnum(['CC', 'TI', 'TE', 'PP', 'PPT', 'NIT'])
  type_document?: string;

  @IsOptional()
  @IsString()
  number_document?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  has_premium_service?: boolean;

  @IsOptional()
  has_vip_service?: boolean;
}