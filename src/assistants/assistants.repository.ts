import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { ToolOutput } from './interfaces/tool-outputs.interface';

@Injectable()
export class AssistantsRepository {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  createThread() {
    const thread = this.openai.beta.threads.create();

    return thread;
  }

  addMessageToThread(threadId: string, message: string) {
    const response = this.openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    return response;
  }

  createRun(threadId: string) {
    const run = this.openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
    });

    return run;
  }

  checkRunStatus(threadId: string, runId: string) {
    const run = this.openai.beta.threads.runs.retrieve(threadId, runId);

    return run;
  }

  getThreadMessages(threadId: string) {
    const messages = this.openai.beta.threads.messages.list(threadId);

    return messages;
  }

  async submitToolOutputsAndPoll(
    threadId: string,
    runId: string,
    toolOutputs: ToolOutput[],
  ) {
    try {
      const run = await this.openai.beta.threads.runs.submitToolOutputsAndPoll(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      return run;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to submit tool outputs and poll the run status',
      );
    }
  }
}
