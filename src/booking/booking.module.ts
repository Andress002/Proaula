import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Reservation } from './entities/reservation.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { RoomsModule } from '../rooms/rooms.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation]),
    RoomsModule,
    ClientsModule,
    HttpModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService, TypeOrmModule],
})
export class BookingModule {}
