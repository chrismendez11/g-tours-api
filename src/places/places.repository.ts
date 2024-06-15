import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/modules/prisma/prisma.service';
import { PrismaErrorCodes } from 'src/shared/modules/prisma/constants/prisma-error-codes.constants';
import { CreatePlaceRepositoryDto } from './dto/create-place-repository.dto';

@Injectable()
export class PlacesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createPlace(createPlaceRepositoryDto: CreatePlaceRepositoryDto) {
    try {
      const place = await this.prismaService.place.create({
        data: createPlaceRepositoryDto,
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
        throw new ConflictException('Invalid countryId');
      } else if (
        error.code === PrismaErrorCodes.RecordAlreadyExists &&
        error.meta.target.includes('placeName')
      ) {
        throw new ConflictException('Place name already exists');
      } else if (
        error.code === PrismaErrorCodes.RecordAlreadyExists &&
        error.meta.target.includes('placeKeyword')
      ) {
        throw new ConflictException('Place keyword already exists');
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

  getPlacesAssistant() {
    return this.prismaService.place.findMany({
      orderBy: {
        placeName: 'asc',
      },
      select: {
        placeId: true,
        placeName: true,
      },
    });
  }

  getCountries() {
    return this.prismaService.country.findMany({
      orderBy: {
        countryName: 'asc',
      },
    });
  }
}
