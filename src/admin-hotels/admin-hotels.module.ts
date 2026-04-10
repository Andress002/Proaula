import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminHotels } from './entities/admin-hotels.entity';
import { AdminHotelsService } from './admin-hotels.service';
import { AdminHotelsController } from './admin-hotels.controller';
import { UsersModule } from '../users/users.module';
import { HotelsModule } from '../hotels/hotels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminHotels]),
    UsersModule,
    HotelsModule,
  ],
  controllers: [AdminHotelsController],
  providers: [AdminHotelsService],
  exports: [AdminHotelsService, TypeOrmModule],
})
export class AdminHotelsModule {}
