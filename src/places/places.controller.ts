import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  createPlace(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.createPlace(createPlaceDto);
  }

  @Get()
  getPlaces() {
    return this.placesService.getPlaces();
  }
}
