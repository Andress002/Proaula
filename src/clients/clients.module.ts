import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AdminHotelsModule } from '../admin-hotels/admin-hotels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    AdminHotelsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService, TypeOrmModule],
})
export class ClientsModule {}
