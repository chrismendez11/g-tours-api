import { Body, Controller, Get, Post } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  createTour(@Body() createTourDto: CreateTourDto) {
    return this.toursService.createTour(createTourDto);
  }

  @Get()
  getTours() {
    return this.toursService.getTours();
  }
}
