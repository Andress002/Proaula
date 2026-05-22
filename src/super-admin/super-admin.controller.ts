import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { CreateSuperAdminDto } from '../dto/super-admin.dto';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post('create')
  async create(@Body() data: CreateSuperAdminDto) {
    return this.superAdminService.createSuperAdmin(data as any);
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.superAdminService.findAllsuperAdminById(id);
  }
}
