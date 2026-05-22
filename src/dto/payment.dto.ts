import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class paymentDto {
  @IsString()
  name: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  active: boolean;
}
