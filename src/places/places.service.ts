import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PlacesRepository } from './places.repository';
import { CreatePlaceDto } from './dto/create-place.dto';
import { AssistantsService } from 'src/assistants/assistants.service';
import { UpdateAssistantFunctionEnumDto } from 'src/assistants/dto/update-assistant-function-enum.dto';
import { FunctionCallingConstants } from 'src/assistants/constants/function-calling.constants';
import { createKeyWord } from 'src/shared/helpers/create-key-word.helper';
import { CreatePlaceRepositoryDto } from './dto/create-place-repository.dto';

@Injectable()
export class PlacesService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    @Inject(forwardRef(() => AssistantsService))
    private readonly assistantsService: AssistantsService,
  ) {}

  async createPlace(createPlaceDto: CreatePlaceDto) {
    // Creating a placeKeyWord using the placeName
    const { placeName } = createPlaceDto;
    const placeKeyWord = createKeyWord(placeName);

    const createPlaceRepositoryDto: CreatePlaceRepositoryDto = {
      ...createPlaceDto,
      placeKeyWord,
    };
    const place = await this.placesRepository.createPlace(
      createPlaceRepositoryDto,
    );

    // Updating the assistant function enum with the new placeKeyWord
    const updateAssistantFunctionEnumDto: UpdateAssistantFunctionEnumDto = {
      functionName: FunctionCallingConstants.GET_TOURS_BY_PLACE,
      functionProperty: 'placeKeyWord',
      enumValue: placeKeyWord,
      enumValueAction: 'add',
    };
    await this.assistantsService.updateAssistantEnumFunction(
      updateAssistantFunctionEnumDto,
    );

    return place;
  }

  getPlaces() {
    return this.placesRepository.getPlaces();
  }

  getCountries() {
    return this.placesRepository.getCountries();
  }

  async getCountriesAssistant(): Promise<string> {
    const countries = await this.getCountries();

    const countriesString = countries
      .map((country) => country.countryName)
      .join(', ');

    return countriesString;
  }

  async getPlacesAssistant() {
    const places = await this.placesRepository.getPlacesAssistant();

    const placesString = places.map((place) => place.placeName).join(', ');

    return placesString;
  }
}
