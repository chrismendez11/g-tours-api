import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Response } from 'express';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.createReservation(createReservationDto);
  }

  @Get()
  getReservations() {
    return this.reservationsService.getReservations();
  }

  @Get('file')
  async getReservationsFile(@Res() res: Response) {
    const { contentType, fileName, data } =
      await this.reservationsService.getReservationsFile();

    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(data);
  }
}
