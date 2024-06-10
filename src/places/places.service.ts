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

  getCountries() {
    return this.placesRepository.getCountries();
  }

  async getCountriesAssistant(): Promise<string> {
    const countries = await this.getCountries();

    const countriesString = countries
      .map((country) => country.countryName)
      .join(', ');

    return countriesString;
  }

  async getPlacesAssistant() {
    const places = await this.placesRepository.getPlacesAssistant();

    const placesString = places.map((place) => place.placeName).join(', ');

    return placesString;
  }
}
