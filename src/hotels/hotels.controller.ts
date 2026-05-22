import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { HotelsService } from './hotels.service';
import { CreateHotelDto, UpdateHotelDto } from '../dto/hotels.dto';

@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  @Get('all')
  async findAll() {
    return await this.hotelsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.hotelsService.findOne(id);
  }

  @Post('create')
  async create(@Body() newHotel: CreateHotelDto) {
    return await this.hotelsService.create(newHotel as any);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dataHotel: UpdateHotelDto,
  ) {
    return await this.hotelsService.update(id, dataHotel as any);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<string> {
    return await this.hotelsService.remove(id);
  }

  @Get(':id/revenue-prediction')
  async getRevenuePrediction(@Param('id') id: number) {
    return await this.hotelsService.getRevenuePrediction(id);
  }

  @Get(':id/monthly-revenue')
  async getMonthlyRevenue(@Param('id') id: number) {
    return await this.hotelsService.getMonthlyRevenue(id);
  }
}
