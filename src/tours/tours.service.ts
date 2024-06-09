import { Injectable } from '@nestjs/common';
import { ToursRepository } from './tours.repository';
import { CreateTourDto } from './dto/create-tour.dto';
import * as dayjs from 'dayjs';
import { CreateTourRepositoryDto } from './dto/create-tour-repository.dto';
import { TourStatusConstants } from './tour-status/tour-status.constants';

@Injectable()
export class ToursService {
  constructor(private readonly toursRepository: ToursRepository) {}

  createTour(createTourDto: CreateTourDto) {
    const { tourStartDate, tourEndDate } = createTourDto;
    const createTourRepositoryDto: CreateTourRepositoryDto = {
      ...createTourDto,
      tourStartDate: dayjs(tourStartDate).toDate(),
      tourEndDate: dayjs(tourEndDate).toDate(),
      tourStatusId: TourStatusConstants.AVAILABLE,
      placeIds: createTourDto.placeIds.map((placeId) => ({ placeId })),
    };

    return this.toursRepository.createTour(createTourRepositoryDto);
  }

  getTours() {
    return this.toursRepository.getTours();
  }
}
