import { Injectable } from '@nestjs/common';
import { PlacesRepository } from './places.repository';
import { CreatePlaceDto } from './dto/create-place.dto';

@Injectable()
export class PlacesService {
  constructor(private readonly placesRepository: PlacesRepository) {}

  createPlace(createPlaceDto: CreatePlaceDto) {
    return this.placesRepository.createPlace(createPlaceDto);
  }

  getPlaces() {
    return this.placesRepository.getPlaces();
  }
}
