import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlaceDto {
  @IsNotEmpty()
  @IsString()
  placeName: string;

  @IsOptional()
  @IsString()
  placeDescription?: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  countryId: number;
}
