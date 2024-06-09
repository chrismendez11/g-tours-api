export class CreateTourRepositoryDto {
  tourName?: string;
  tourStartDate: Date;
  tourEndDate: Date;
  tourItinerary?: string;
  tourTicketsAvailability: number;
  tourCost: number;
  tourStatusId: string;
  placeIds: Place[];
}

class Place {
  placeId: string;
}
