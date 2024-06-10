import { Body, Controller, Post } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { AskAssistantDto } from './dto/ask-assistant.dto';

@Controller('assistants')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @Post('ask')
  askAssistant(@Body() askAssistantDto: AskAssistantDto) {
    return this.assistantsService.askAssistant(askAssistantDto);
  }
}
