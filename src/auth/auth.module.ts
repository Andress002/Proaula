import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './auth.strategy';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'yourSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
    ClientsModule,
    SuperAdminModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
