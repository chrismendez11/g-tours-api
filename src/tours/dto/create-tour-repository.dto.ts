export class CreateTourRepositoryDto {
  tourName?: string;
  tourStartDate: Date;
  tourEndDate: Date;
  tourKeyWord: string;
  tourItinerary?: string;
  tourTicketsAvailability: number;
  tourCost: number;
  tourStatusId: string;
  placeIds: Place[];
}

class Place {
  placeId: string;
}
