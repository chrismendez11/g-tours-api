import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AskAssistantDto {
  @IsOptional()
  @IsString()
  threadId?: string;

  @IsNotEmpty()
  @IsString()
  question: string;
}
