import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTourDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  tourName?: string;

  @IsOptional()
  @IsDateString()
  tourStartDate: string;

  @IsOptional()
  @IsDateString()
  tourEndDate: string;

  @IsOptional()
  @IsString()
  tourItinerary?: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  tourTicketsAvailability: number;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  tourCost: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  placeIds: string[];
}
