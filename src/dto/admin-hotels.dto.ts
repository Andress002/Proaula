import { IsInt } from 'class-validator';

export class CreateAdminHotelsDto {
  @IsInt()
  userId: number;

  @IsInt()
  hotelId: number;
}