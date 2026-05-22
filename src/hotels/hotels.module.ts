import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Hotel } from './entities/hotel.entity';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel]), HttpModule, ConfigModule],
  controllers: [HotelsController],
  providers: [HotelsService],
  exports: [HotelsService, TypeOrmModule],
})
export class HotelsModule {}
