import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { PrismaErrorCodes } from 'src/shared/modules/prisma/constants/prisma-error-codes.constants';

@Injectable()
export class PlacesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlace(createPlaceDto: CreatePlaceDto) {
    try {
      const place = await this.prismaService.place.create({
        data: createPlaceDto,
        select: {
          placeId: true,
        },
      });
      return place;
    } catch (error) {
      if (
        error.code === PrismaErrorCodes.InvalidForeignKey &&
        error.meta.field_name === 'countryId'
      ) {
        throw new BadRequestException('Invalid countryId');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  getPlaces() {
    return this.prismaService.place.findMany({
      orderBy: {
        placeName: 'asc',
      },
      include: {
        Country: true,
      },
    });
  }
}
