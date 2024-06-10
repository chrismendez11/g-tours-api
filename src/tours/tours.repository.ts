import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreateTourRepositoryDto } from './dto/create-tour-repository.dto';

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
}
