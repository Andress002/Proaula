import { IsOptional } from 'class-validator';
import { RoomsDto } from './rooms.dto';

export class CreateRoomDto extends RoomsDto {
  @IsOptional()
  hotelId?: any;
}