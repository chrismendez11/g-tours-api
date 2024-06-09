import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PlacesRepository } from './places.repository';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService, PlacesRepository],
})
export class PlacesModule {}
