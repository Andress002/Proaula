import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AdminHotelsService } from './admin-hotels.service';
import { CreateAdminHotelsDto } from '../dto/admin-hotels.dto';

@Controller('admin-hotels')
export class AdminHotelsController {
  constructor(private adminHotelsService: AdminHotelsService) {}

  @Get('users/:userId/hotels')
  async findHotelsByAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return await this.adminHotelsService.findHotelsByAdmin(userId);
  }

  @Get('hotels/:hotelId/users')
  async findAdminsByHotel(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return await this.adminHotelsService.findAdminsByHotel(hotelId);
  }

  @Get('users/:userId/hotel')
  async findHotelByAdmin(@Param('userId', ParseIntPipe) userId: number) {
    return await this.adminHotelsService.findHotelByAdmin(userId);
  }

  @Post('create')
  async create(@Body() data: CreateAdminHotelsDto) {
    return await this.adminHotelsService.create(data.userId, data.hotelId);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.adminHotelsService.delete(id);
  }
}
