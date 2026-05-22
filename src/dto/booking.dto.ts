import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  roomId: number;

  @IsInt()
  clientId: number;

  @IsEnum(['canceled', 'confirmed', 'refunded'])
  status: string;

  @IsDateString()
  check_in: string;

  @IsDateString()
  check_out: string;
}

export class UpdateReservationDto {
  @IsOptional()
  @IsInt()
  roomId?: number;

  @IsOptional()
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsEnum(['canceled', 'confirmed', 'refunded'])
  status?: string;

  @IsOptional()
  @IsDateString()
  check_in?: string;

  @IsOptional()
  @IsDateString()
  check_out?: string;
}