import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { HotelsModule } from '../hotels/hotels.module';
import { AdminHotelsModule } from '../admin-hotels/admin-hotels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    HotelsModule,
    AdminHotelsModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService, TypeOrmModule],
})
export class RoomsModule {}
