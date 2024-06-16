import {
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { ToursRepository } from './tours.repository';
import { CreateTourDto } from './dto/create-tour.dto';
import { CreateTourRepositoryDto } from './dto/create-tour-repository.dto';
import { TourStatusConstants } from './tour-status/tour-status.constants';
import { convertToDateString } from 'src/shared/helpers/convert-to-day-string.helper';
import { createKeywordWithDate } from 'src/shared/helpers/create-key-word-with-date.helper';
import { convertToDate } from 'src/shared/helpers/convert-to-date.helper';
import { UpdateAssistantFunctionEnumDto } from 'src/assistants/dto/update-assistant-function-enum.dto';
import { FunctionCallingConstants } from 'src/assistants/constants/function-calling.constants';
import { AssistantsService } from 'src/assistants/assistants.service';
import { ReservationsService } from 'src/reservations/reservations.service';
import { convertToDateHourString } from 'src/shared/helpers/convert-to-day-hour-string.helper';

@Injectable()
export class ToursService {
  constructor(
    private readonly toursRepository: ToursRepository,
    @Inject(forwardRef(() => AssistantsService))
    private readonly assistantsService: AssistantsService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async createTour(createTourDto: CreateTourDto) {
    const { tourName, tourStartDate, tourEndDate, placeIds } = createTourDto;

    let tourNameAssigned = tourName;
    if (!tourName && placeIds.length > 1) {
      throw new ConflictException(
        "The tour must have a name when there's is more than one place in the tour.",
      );
    } else if (!tourName) {
      const { placeName } = await this.toursRepository.getPlaceById(
        placeIds[0],
      );
      tourNameAssigned = placeName;
    }

    // Creating a unique tourKeyWord based on the tourName and tourStartDate -> VOLCAN_PACAYA_JUNE_15_2024
    const tourKeyWord = createKeywordWithDate(tourNameAssigned, tourStartDate);

    const doesTourKeyWordExist =
      await this.toursRepository.getTourByKeyword(tourKeyWord);

    if (doesTourKeyWordExist) {
      throw new ConflictException(
        "There's already a tour with the same date and with the same name. Please change the tour name or the date.",
      );
    }

    const createTourRepositoryDto: CreateTourRepositoryDto = {
      ...createTourDto,
      tourName: tourNameAssigned,
      tourStartDate: convertToDate(tourStartDate),
      tourEndDate: convertToDate(tourEndDate),
      tourKeyWord,
      tourStatusId: TourStatusConstants.AVAILABLE,
      placeIds: createTourDto.placeIds.map((placeId) => ({ placeId })),
    };

    const { tourId } = await this.toursRepository.createTour(
      createTourRepositoryDto,
    );

    // Updating the assistant function enum with the new tourKeyWord
    const updateAssistantFunctionEnumDto: UpdateAssistantFunctionEnumDto = {
      functionName: FunctionCallingConstants.GET_TOURS_BY_PLACE,
      functionProperty: 'placeKeyWord',
      enumValue: tourKeyWord,
      enumValueAction: 'add',
    };
    await this.assistantsService.updateAssistantEnumFunction(
      updateAssistantFunctionEnumDto,
    );

    return {
      message: 'Tour created successfully',
      tourId,
    };
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

  async getTourById(tourId: string) {
    const tourRepository = await this.toursRepository.getTourById(tourId);

    const totalReservationPeopleNumber =
      await this.reservationsService.getTotalTourReservationPeopleNumber(
        tourId,
      );

    const {
      tourName,
      tourItinerary,
      tourTicketsAvailability,
      TourStatus,
      tourCost,
      tourStartDate,
      tourEndDate,
      tourCreatedAt,
      _count,
    } = tourRepository;
    const tour = {
      tourId,
      tourName,
      tourItinerary,
      tourTicketsAvailability,
      tourStatus: TourStatus.tourStatusName,
      tourCost: `Q${Number(tourCost)}`,
      tourStartDate: convertToDateString(tourStartDate),
      tourEndDate: convertToDateString(tourEndDate),
      tourCreatedAt: convertToDateHourString(tourCreatedAt),
      totalReservations: _count.Reservation,
      totalReservationPeopleNumber,
    };

    return tour;
  }

  async cancelTourById(tourId: string) {
    const tour = await this.toursRepository.getTourById(tourId);

    if (tour.TourStatus.tourStatusId !== TourStatusConstants.AVAILABLE) {
      throw new ConflictException('The tour is not available to be cancelled.');
    }

    // Removing the tourKeyWord from the assistant function enum
    const updateAssistantFunctionEnumDto: UpdateAssistantFunctionEnumDto = {
      functionName: FunctionCallingConstants.GET_TOUR_BY_KEYWORD,
      functionProperty: 'tourKeyWord',
      enumValue: tour.tourKeyWord,
      enumValueAction: 'remove',
    };
    await this.assistantsService.updateAssistantEnumFunction(
      updateAssistantFunctionEnumDto,
    );

    const tourStatusId = TourStatusConstants.CANCELLED;
    await this.toursRepository.cancelTourById(tourId, tourStatusId);

    return {
      message: 'Tour cancelled successfully',
      tourId,
    };
  }
}
