import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateReservationRepositoryDto } from './dto/create-reservation-repository.dto';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  makeReservation(
    createReservationRepositoryDto: CreateReservationRepositoryDto,
  ) {
    return this.prismaService.reservation.create({
      data: createReservationRepositoryDto,
      select: {
        reservationId: true,
      },
    });
  }

  getTourIdByKeyword(tourKeyWord: string) {
    return this.prismaService.tour.findUnique({
      where: {
        tourKeyWord,
      },
      select: {
        tourId: true,
      },
    });
  }

  getReservations() {
    return this.prismaService.reservation.findMany({
      orderBy: {
        reservationCreatedAt: 'asc',
      },
      select: {
        reservationId: true,
        reservationHolderFullName: true,
        reservationContactPhone: true,
        reservationPeopleNumber: true,
        ReservationPaymentStatus: true,
        reservationCreatedAt: true,
        Tour: {
          select: {
            tourName: true,
            tourCost: true,
            Tour_Place: {
              select: {
                Place: {
                  select: {
                    placeName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
