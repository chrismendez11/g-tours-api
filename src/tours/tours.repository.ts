import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateTourRepositoryDto } from './dto/create-tour-repository.dto';
import { PrismaErrorCodes } from 'src/shared/modules/prisma/constants/prisma-error-codes.constants';

@Injectable()
export class ToursRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createTour(createTourRepositoryDto: CreateTourRepositoryDto) {
    const { placeIds, ...createTourDto } = createTourRepositoryDto;
    return this.prismaService.tour.create({
      data: {
        ...createTourDto,
        Tour_Place: {
          createMany: { data: placeIds },
        },
      },
      select: {
        tourId: true,
      },
    });
  }

  getTours() {
    return this.prismaService.tour.findMany({
      orderBy: [{ tourStartDate: 'desc' }, { tourEndDate: 'desc' }],
      include: {
        Tour_Place: {
          select: {
            Place: true,
          },
        },
        TourStatus: true,
      },
    });
  }

  getToursAssistant(tourStatusId: string) {
    return this.prismaService.tour.findMany({
      orderBy: [{ tourStartDate: 'desc' }, { tourEndDate: 'desc' }],
      where: {
        tourStatusId,
      },
      select: {
        tourId: true,
        tourName: true,
        tourStartDate: true,
        tourEndDate: true,
        Tour_Place: {
          select: {
            Place: {
              select: {
                placeId: true,
                placeName: true,
              },
            },
          },
        },
        Reservation: {
          select: {
            reservationId: true,
          },
        },
      },
    });
  }

  getToursByCountryKeyWord(countryKeyWord: string) {
    return this.prismaService.tour.findMany({
      where: {
        Tour_Place: {
          some: {
            Place: {
              Country: {
                countryKeyWord,
              },
            },
          },
        },
      },
      select: {
        tourId: true,
        tourName: true,
        tourStartDate: true,
        tourEndDate: true,
        Tour_Place: {
          select: {
            Place: {
              select: {
                placeId: true,
                placeName: true,
              },
            },
          },
        },
      },
    });
  }

  getTourByKeyword(tourKeyWord: string) {
    return this.prismaService.tour.findUnique({
      where: {
        tourKeyWord,
      },
      select: {
        tourId: true,
        tourName: true,
        tourStartDate: true,
        tourEndDate: true,
        tourCost: true,
        Tour_Place: {
          select: {
            Place: {
              select: {
                placeId: true,
                placeName: true,
              },
            },
          },
        },
      },
    });
  }

  async getPlaceById(placeId: string) {
    try {
      const place = await this.prismaService.place.findUnique({
        where: {
          placeId,
        },
        select: {
          placeId: true,
          placeName: true,
          Country: {
            select: {
              countryName: true,
            },
          },
        },
      });
      return place;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Place not found.');
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
          tourName: true,
          tourKeyWord: true,
          tourStartDate: true,
          tourEndDate: true,
          TourStatus: true,
          tourCreatedAt: true,
          tourItinerary: true,
          tourCost: true,
          tourTicketsAvailability: true,
          _count: {
            select: {
              Reservation: true,
            },
          },
        },
      });
      return tour;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found.');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async cancelTourById(tourId: string, tourStatusId: string) {
    try {
      const tour = await this.prismaService.tour.update({
        where: {
          tourId,
        },
        data: {
          tourStatusId,
          tourKeyWord: null, // Removing the tour keyword so if another tour is created with the same name and date, there will be no conflict
        },
        select: {
          tourId: true,
        },
      });
      return tour;
    } catch (error) {
      if (error.code === PrismaErrorCodes.RecordDoesNotExist) {
        throw new NotFoundException('Tour not found.');
      } else if (
        error.code === PrismaErrorCodes.InvalidForeignKey &&
        error.meta.target.includes('tourStatusId')
      ) {
        throw new BadRequestException('Invalid tour status id');
      }
    }
  }
}
