import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

// Entities
import { User } from '../users/entities/user.entity';
import { super_admin } from '../super-admin/entities/super-admin.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Room } from '../rooms/entities/room.entity';
import { Client } from '../clients/entities/client.entity';
import { AdminHotels } from '../admin-hotels/entities/admin-hotels.entity';
import { Reservation } from '../booking/entities/reservation.entity';
import { Payment } from '../payment/entities/payment.entity';
import { PaymentReservation } from '../payment-booking/entities/payment-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      super_admin,
      Hotel,
      Room,
      Client,
      AdminHotels,
      Reservation,
      Payment,
      PaymentReservation,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
