import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationRepositoryDto } from './dto/create-reservation-repository.dto';
import { CreateReservationAssistantDto } from './dto/create-reservation-assistant.dto';
import { ReservationPaymentStatusConstants } from './reservation-payment-status/reservation-payment-status.constants';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async makeReservationAssistant(
    createReservationAssistantDto: CreateReservationAssistantDto,
  ) {
    const { tourKeyWord, ...createReservationDto } =
      createReservationAssistantDto;
    const { tourId } =
      await this.reservationsRepository.getTourIdByKeyword(tourKeyWord);
    const createReservationRepositoryDto: CreateReservationRepositoryDto = {
      tourId,
      ...createReservationDto,
      reservationPaymentStatusId:
        ReservationPaymentStatusConstants.PAYMENT_PENDING,
    };

    await this.reservationsRepository.makeReservation(
      createReservationRepositoryDto,
    );

    return 'Reservación creada exitosamente! Un asistente de G-Tours de pondrá en contacto con el cliente para la confirmación de la reserva y para proveer los detalles para realizar el pago.';
  }

  getReservations() {
    return this.reservationsRepository.getReservations();
  }
}
