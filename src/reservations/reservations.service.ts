import { ConflictException, Injectable } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationRepositoryDto } from './dto/create-reservation-repository.dto';
import { CreateReservationAssistantDto } from './dto/create-reservation-assistant.dto';
import { ReservationPaymentStatusConstants } from './reservation-payment-status/reservation-payment-status.constants';
import { CreateReservationDto } from './dto/create-reservation.dto';
import * as Exceljs from 'exceljs';
import * as mime from 'mime-types';
import { convertToDateString } from 'src/shared/helpers/convert-to-day-string.helper';
import { TourStatusConstants } from 'src/tours/tour-status/tour-status.constants';
import { CreateReservationValidationsDto } from './dto/create-reservation-validations.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createReservation(createReservationDto: CreateReservationDto) {
    const { tourId, reservationPeopleNumber } = createReservationDto;

    await this.createReservationValidations({
      tourId,
      reservationPeopleNumber,
    });

    const reservationPaymentStatusId =
      ReservationPaymentStatusConstants.PAYMENT_PENDING;
    const createReservationRepositoryDto: CreateReservationRepositoryDto = {
      ...createReservationDto,
      reservationPaymentStatusId,
    };

    return this.reservationsRepository.createReservation(
      createReservationRepositoryDto,
    );
  }

  async createReservationAssistant(
    createReservationAssistantDto: CreateReservationAssistantDto,
  ) {
    const { tourKeyWord, ...createReservationDto } =
      createReservationAssistantDto;

    const { tourId } =
      await this.reservationsRepository.getTourIdByKeyword(tourKeyWord);

    await this.createReservationValidations({
      tourId,
      reservationPeopleNumber: createReservationDto.reservationPeopleNumber,
    });

    const reservationPaymentStatusId =
      ReservationPaymentStatusConstants.PAYMENT_PENDING;
    const createReservationRepositoryDto: CreateReservationRepositoryDto = {
      tourId,
      ...createReservationDto,
      reservationPaymentStatusId,
    };

    await this.reservationsRepository.createReservation(
      createReservationRepositoryDto,
    );

    return 'Reservación creada exitosamente! Un asistente de G-Tours de pondrá en contacto con el cliente para la confirmación de la reserva y para proveer los detalles para realizar el pago.';
  }

  getReservations() {
    return this.reservationsRepository.getReservations();
  }

  async getReservationsFile() {
    const reservationsRepository =
      await this.reservationsRepository.getReservations();

    const workbook = new Exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Reservaciones');

    worksheet.columns = [
      {
        header: 'Nombre del titular de la reserva',
        key: 'reservationHolderFullName',
        width: 30,
      },
      {
        header: 'Teléfono de contacto',
        key: 'reservationContactPhone',
        width: 20,
      },
      {
        header: 'Número de personas',
        key: 'reservationPeopleNumber',
        width: 20,
      },
      { header: 'Nombre del tour', key: 'tourName', width: 30 },
      { header: 'Total a pagar', key: 'reservationTotalPrice', width: 20 },
      { header: 'Estado de pago', key: 'ReservationPaymentStatus', width: 20 },
      { header: 'Fecha de reserva', key: 'reservationCreatedAt', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const reservations = reservationsRepository.map((reservation) => {
      const {
        reservationHolderFullName,
        reservationContactPhone,
        reservationPeopleNumber,
        Tour,
        ReservationPaymentStatus,
        reservationCreatedAt,
      } = reservation;
      return {
        reservationHolderFullName,
        reservationContactPhone,
        reservationPeopleNumber,
        tourName: Tour.tourName,
        reservationTotalPrice: `Q${reservationPeopleNumber * Number(Tour.tourCost)}`,
        ReservationPaymentStatus:
          ReservationPaymentStatus.reservationPaymentStatusName,
        reservationCreatedAt: convertToDateString(reservationCreatedAt),
      };
    });

    worksheet.addRows(reservations);

    const buffer = await workbook.xlsx.writeBuffer();
    const fileExtension = 'xlsx';

    return {
      contentType: mime.contentType(fileExtension) as string,
      fileName: `Reservaciones-G-Tours.${fileExtension}`,
      data: Buffer.from(buffer),
    };
  }

  getTotalTourReservationPeopleNumber(tourId: string) {
    return this.reservationsRepository.getTotalTourReservationPeopleNumber(
      tourId,
    );
  }

  private async createReservationValidations(
    createReservationValidationsDto: CreateReservationValidationsDto,
  ) {
    const { tourId, reservationPeopleNumber } = createReservationValidationsDto;

    const tour = await this.reservationsRepository.getTourById(tourId);
    const { tourStatusId } = tour;

    if (tourStatusId !== TourStatusConstants.AVAILABLE) {
      throw new ConflictException(
        "The tour you're trying to book is not available for reservations. Please try booking another tour.",
      );
    }

    const availableTourReservations =
      await this.availableTourReservations(tourId);

    if (availableTourReservations <= 0) {
      throw new ConflictException(
        "There's no available reservations for the tour you're trying to book. Please add more tickets to the tour or try booking another tour.",
      );
    } else if (availableTourReservations < reservationPeopleNumber) {
      throw new ConflictException(
        `There are only ${availableTourReservations} available reservations for the tour you're trying to book. Please add more tickets to the tour or try booking another tour.`,
      );
    }
  }

  private async availableTourReservations(tourId: string): Promise<number> {
    const tourTicketsAvailability =
      await this.reservationsRepository.getTourTicketsAvailability(tourId);
    const totalTourReservationPeopleNumber =
      await this.reservationsRepository.getTotalTourReservationPeopleNumber(
        tourId,
      );

    const totalTourReservationsAvailable =
      tourTicketsAvailability - totalTourReservationPeopleNumber;

    return totalTourReservationsAvailable;
  }
}
