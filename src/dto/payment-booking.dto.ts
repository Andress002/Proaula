import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreatePaymentReservationDto {
  @IsInt()
  reservationId: number;

  @IsOptional()
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsInt()
  roomId?: number;

  @IsNumber()
  amount: number;

  @IsEnum(['visa', 'mastercard', 'paypal', 'other'])
  payment_method: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'canceled', 'refunded'])
  status?: string;
}