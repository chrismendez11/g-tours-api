import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { AssistantsRepository } from './assistants.repository';
import { AskAssistantDto } from './dto/ask-assistant.dto';
import { RunStatusConstants } from './constants/run-status.constants';
import { FunctionCallingConstants } from './constants/function-calling.constants';
import type { Run } from 'openai/resources/beta/threads/runs/runs';
import { PlacesService } from 'src/places/places.service';
import { ToursService } from 'src/tours/tours.service';
import { ReservationsService } from 'src/reservations/reservations.service';
import { AssistantTool } from 'openai/resources/beta/assistants';
import { UpdateAssistantFunctionEnumDto } from './dto/update-assistant-function-enum.dto';

@Injectable()
export class AssistantsService {
  constructor(
    private readonly assistantsRepository: AssistantsRepository,
    @Inject(forwardRef(() => PlacesService))
    private readonly placesService: PlacesService,
    private readonly toursService: ToursService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async askAssistant(askAssistantDto: AskAssistantDto) {
    let { threadId } = askAssistantDto;
    const { question } = askAssistantDto;

    if (!threadId) {
      console.log('Creating a new thread');
      const { id } = await this.assistantsRepository.createThread();
      threadId = id;
    }
    console.log('Adding message to thread');
    await this.assistantsRepository.addMessageToThread(threadId, question);
    console.log('Creating a new run');
    const run = await this.assistantsRepository.createRun(threadId);
    console.log('Checking run status');
    await this.checkRunStatus(threadId, run.id);
    console.log('Getting thread messages');
    const messages = await this.getThreadMessages(threadId);

    // return {
    //   threadId,
    //   messages,
    // };
    console.log(messages);
    return {
      threadId,
      message: messages[messages.length - 1].content,
    };
  }

  private async checkRunStatus(threadId: string, runId: string) {
    const run = await this.assistantsRepository.checkRunStatus(threadId, runId);
    const { status } = run;
    console.log(status);
    switch (status) {
      case RunStatusConstants.IN_PROGRESS:
      case RunStatusConstants.QUEUED:
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.checkRunStatus(threadId, runId);
      case RunStatusConstants.REQUIRES_ACTION:
        return await this.manageRequiredActions(threadId, run);
      case RunStatusConstants.FAILED:
        console.log(run.last_error);
        throw new InternalServerErrorException(
          'Assistant failed to answer the question',
        );
      case RunStatusConstants.INCOMPLETE:
        console.log(run.incomplete_details);
        throw new InternalServerErrorException(
          'Assistant failed to answer the question',
        );
      default:
        return true;
    }
  }

  private async getThreadMessages(threadId: string) {
    const messagesRepository =
      await this.assistantsRepository.getThreadMessages(threadId);
    const { data } = messagesRepository;
    console.log(data);
    const messages = data.map((message) => {
      return {
        messageId: message.id,
        role: message.role,
        content: message.content[0]['text'].value,
      };
    });

    return messages.reverse();
  }

  private async manageRequiredActions(threadId: string, run: Run) {
    console.log(
      'Function name:',
      run.required_action.submit_tool_outputs.tool_calls[0].function.name,
    );
    const toolOutputsPromise =
      run.required_action.submit_tool_outputs.tool_calls.map(async (tool) => {
        switch (tool.function.name) {
          case FunctionCallingConstants.GET_TOUR_COUNTRIES:
            const countries = await this.placesService.getCountriesAssistant();
            return {
              tool_call_id: tool.id,
              output: countries,
            };
          case FunctionCallingConstants.GET_TOUR_PLACES:
            const places = await this.placesService.getPlacesAssistant();
            return {
              tool_call_id: tool.id,
              output: places,
            };
          case FunctionCallingConstants.GET_AVAILABLE_TOURS:
            const tours = await this.toursService.getToursAssistant();
            return {
              tool_call_id: tool.id,
              output: tours,
            };
          case FunctionCallingConstants.GET_TOURS_BY_COUNTRY:
            console.log('Tool arguments:', tool.function.arguments);
            const toursByCountry =
              await this.toursService.getToursByCountryAssistant(
                JSON.parse(tool.function.arguments),
              );
            return {
              tool_call_id: tool.id,
              output: toursByCountry,
            };
          case FunctionCallingConstants.GET_TOUR_BY_KEYWORD:
            const tourByKeyword =
              await this.toursService.getTourByKeywordAssistant(
                JSON.parse(tool.function.arguments),
              );
            return {
              tool_call_id: tool.id,
              output: tourByKeyword,
            };
          case FunctionCallingConstants.BOOK_TOUR:
            const reservation =
              await this.reservationsService.createReservationAssistant(
                JSON.parse(tool.function.arguments),
              );
            return {
              tool_call_id: tool.id,
              output: reservation,
            };
          default:
            throw new InternalServerErrorException('Function not found');
        }
      });

    const toolOutputs = await Promise.all(toolOutputsPromise);
    console.log('Tool outputs to submit:', toolOutputs);
    if (toolOutputs.length > 0) {
      await this.assistantsRepository.submitToolOutputsAndPoll(
        threadId,
        run.id,
        toolOutputs,
      );
      console.log('Tool outputs submitted successfully.');
      return this.checkRunStatus(threadId, run.id);
    } else {
      console.log('No tool outputs to submit.');
    }
  }

  /**
   * Modifies the enum values of a function property of the assistant tools.
   */
  async updateAssistantEnumFunction(
    updateAssistantFunctionEnumDto: UpdateAssistantFunctionEnumDto,
  ) {
    const { functionName, functionProperty, enumValue, enumValueAction } =
      updateAssistantFunctionEnumDto;

    const { tools } = await this.assistantsRepository.getAssistant();

    const functions = tools.filter((tool) => tool.type === 'function');

    const functionToModify: AssistantTool = functions.find(
      (value) => (value as any).function.name === functionName,
    );

    const functionEnums: string[] = (functionToModify as any).function
      .parameters.properties[functionProperty].enum;

    switch (enumValueAction) {
      case 'add':
        functionEnums.push(enumValue);
        break;
      case 'remove':
        const index = functionEnums.indexOf(enumValue);
        if (index > -1) {
          functionEnums.splice(index, 1);
        }
        break;
      default:
        throw new BadRequestException('Invalid enum value action');
    }

    return this.assistantsRepository.updateAssistant(tools);
  }
}
