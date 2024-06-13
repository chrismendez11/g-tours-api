import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from './reservations.repository';
import { CreateReservationRepositoryDto } from './dto/create-reservation-repository.dto';
import { CreateReservationAssistantDto } from './dto/create-reservation-assistant.dto';
import { ReservationPaymentStatusConstants } from './reservation-payment-status/reservation-payment-status.constants';
import { CreateReservationDto } from './dto/create-reservation.dto';
import * as Exceljs from 'exceljs';
import * as mime from 'mime-types';
import { convertToDateString } from 'src/shared/helpers/convert-to-day-string.helper';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  createReservation(createReservationDto: CreateReservationDto) {
    const createReservationRepositoryDto: CreateReservationRepositoryDto = {
      ...createReservationDto,
      reservationPaymentStatusId:
        ReservationPaymentStatusConstants.PAYMENT_PENDING,
    };

    return this.reservationsRepository.makeReservation(
      createReservationRepositoryDto,
    );
  }

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
}
