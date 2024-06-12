import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  reservationHolderFullName: string;

  @IsOptional()
  @IsString()
  reservationContactPhone?: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  reservationPeopleNumber: number;

  @IsNotEmpty()
  @IsUUID()
  tourId: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  reservationNote?: string;
}
