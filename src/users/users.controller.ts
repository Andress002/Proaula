import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('all')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOne(id);
  }

  @Post('create')
  async create(@Body() newUser: CreateUserDto) {
    return await this.usersService.create(newUser as any);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dataUser: UpdateUserDto,
  ) {
    return await this.usersService.update(id, dataUser as any);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<string> {
    return await this.usersService.remove(id);
  }
}
