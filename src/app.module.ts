import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { HotelsModule } from './hotels/hotels.module';
import { RoomsModule } from './rooms/rooms.module';
import { AdminHotelsModule } from './admin-hotels/admin-hotels.module';
import { BookingModule } from './booking/booking.module';
import { PaymentBookingModule } from './payment-booking/payment-booking.module';
import { PaymentModule } from './payment/payment.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      })
    }),
    UsersModule,
    ClientsModule,
    HotelsModule,
    RoomsModule,
    AdminHotelsModule,
    BookingModule,
    PaymentBookingModule,
    PaymentModule,
    SuperAdminModule,
    ChatbotModule,
    AuthModule,
  ],
})
export class AppModule {}
