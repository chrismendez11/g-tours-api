import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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

  @Get(':tourId')
  getTourById(@Param('tourId') tourId: string) {
    return this.toursService.getTourById(tourId);
  }

  @Put(':tourId')
  cancelTourById(@Param('tourId') tourId: string) {
    return this.toursService.cancelTourById(tourId);
  }
}
