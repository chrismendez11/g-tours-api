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
}
