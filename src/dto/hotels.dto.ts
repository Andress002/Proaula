import { IsEnum, IsOptional, IsString } from 'class-validator';

export class HotelDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(['hotel', 'hostel', 'motel', 'airbnb', 'other'])
  type_accomodation: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;
}

export class CreateHotelDto extends HotelDto {}

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['hotel', 'hostel', 'motel', 'airbnb', 'other'])
  type_accomodation?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;
}