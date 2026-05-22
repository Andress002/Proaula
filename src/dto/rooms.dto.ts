import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class RoomsDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  price?: any;

  @IsString()
  ability: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  image?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
