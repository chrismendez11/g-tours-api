import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { ToursRepository } from './tours.repository';

@Module({
  controllers: [ToursController],
  providers: [ToursService, ToursRepository],
})
export class ToursModule {}
