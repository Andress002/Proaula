import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentReservation } from './entities/payment-reservation.entity';
import { PaymentBookingService } from './payment-booking.service';
import { PaymentBookingController } from './payment-booking.controller';
import { BookingModule } from '../booking/booking.module';
import { ClientsModule } from '../clients/clients.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentReservation]),
    BookingModule,
    ClientsModule,
    RoomsModule,
  ],
  controllers: [PaymentBookingController],
  providers: [PaymentBookingService],
  exports: [PaymentBookingService, TypeOrmModule],
})
export class PaymentBookingModule {}
