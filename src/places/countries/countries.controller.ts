import { Controller, Get } from '@nestjs/common';
import { PlacesService } from '../places.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  getCountries() {
    return this.placesService.getCountries();
  }
}
