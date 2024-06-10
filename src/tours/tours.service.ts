import { Injectable } from '@nestjs/common';
import { ToursRepository } from './tours.repository';
import { CreateTourDto } from './dto/create-tour.dto';
import * as dayjs from 'dayjs';
import { CreateTourRepositoryDto } from './dto/create-tour-repository.dto';
import { TourStatusConstants } from './tour-status/tour-status.constants';
import { convertToDateString } from 'src/shared/helpers/convert-to-day-string.helper';

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

  async getToursAssistant(): Promise<string> {
    const tourStatusId = TourStatusConstants.AVAILABLE;
    const toursRepository =
      await this.toursRepository.getToursAssistant(tourStatusId);

    const tours = toursRepository.map((tour, i) => {
      const places = tour.Tour_Place.map(
        (tourPlace) => tourPlace.Place.placeName,
      ).join(', ');
      return `${i + 1}. ${tour.tourName} (${places})`;
    });

    return tours.join('\n');
  }

  async getToursByCountryAssistant({ countryKeyWord }: any): Promise<string> {
    const toursRepository =
      await this.toursRepository.getToursByCountryKeyWord(countryKeyWord);

    const tours = toursRepository.map((tour, i) => {
      const places = tour.Tour_Place.map(
        (tourPlace) => tourPlace.Place.placeName,
      ).join(', ');
      return `${i + 1}. ${tour.tourName} (${places})`;
    });

    return tours.join('\n');
  }

  async getTourByKeywordAssistant({ tourKeyWord }: any): Promise<string> {
    const { tourName, tourStartDate, tourEndDate, tourCost, Tour_Place } =
      await this.toursRepository.getTourByKeyword(tourKeyWord);

    const tour = `
        Tour Name: ${tourName}
        Tour Start Date: ${convertToDateString(tourStartDate)}
        Tour End Date: ${convertToDateString(tourEndDate)}
        Cost: Q${tourCost}
        Places: ${Tour_Place.map((tourPlace) => tourPlace.Place.placeName).join(
          ', ',
        )}
        `;

    return tour;
  }
}
