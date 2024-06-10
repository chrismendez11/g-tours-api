export class CreateReservationRepositoryDto {
  tourId: string;
  reservationHolderFullName: string;
  reservationContactPhone?: string;
  reservationPeopleNumber: number;
  reservationNote?: string;
  reservationPaymentStatusId: string;
}
