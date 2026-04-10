import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { super_admin } from './entities/super-admin.entity';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([super_admin])],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService, TypeOrmModule],
})
export class SuperAdminModule {}
