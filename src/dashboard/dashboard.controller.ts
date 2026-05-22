import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('monthly-revenue')
  async getMonthlyRevenue(@Query('hotelId') hotelId?: string) {
    return await this.dashboardService.getMonthlyRevenue(hotelId ? Number(hotelId) : undefined);
  }
}