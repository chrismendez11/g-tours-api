import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateReservationRepositoryDto } from './dto/create-reservation-repository.dto';
import { PrismaErrorCodes } from 'src/shared/modules/prisma/constants/prisma-error-codes.constants';

@Injectable()
export class ReservationsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createReservation(
    createReservationRepositoryDto: CreateReservationRepositoryDto,
  ) {
    return this.prismaService.reservation.create({
      data: createReservationRepositoryDto,
      select: {
        reservationId: true,
      },
    });
  }

  async getTourIdByKeyword(tourKeyWord: string) {
    try {
      const tour = await this.prismaService.tour.findUnique({
        where: {
          tourKeyWord,
        },
        select: {
          tourId: true,
        },
      });
      return tour;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getTourById(tourId: string) {
    try {
      const tour = await this.prismaService.tour.findUnique({
        where: {
          tourId,
        },
        select: {
          tourId: true,
          tourStatusId: true,
        },
      });
      return tour;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found');
      } else {
        throw new InternalServerErrorException();
      }
    }
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

  async getTourTicketsAvailability(tourId: string) {
    try {
      const tourTicketsAvailability = await this.prismaService.tour.findUnique({
        where: {
          tourId,
        },
        select: {
          tourTicketsAvailability: true,
        },
      });
      return tourTicketsAvailability.tourTicketsAvailability;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getTotalTourReservationPeopleNumber(tourId: string) {
    try {
      const totalTourReservations =
        await this.prismaService.reservation.aggregate({
          where: {
            tourId,
          },
          _sum: {
            reservationPeopleNumber: true,
          },
        });
      return totalTourReservations._sum.reservationPeopleNumber;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
