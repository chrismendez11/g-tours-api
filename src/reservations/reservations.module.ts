import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { ReservationsGateway } from './reservations.gateway';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository, ReservationsGateway],
  exports: [ReservationsService],
})
export class ReservationsModule {}
