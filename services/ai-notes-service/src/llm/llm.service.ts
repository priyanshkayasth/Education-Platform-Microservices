import { Injectable } from '@nestjs/common';
import { HuggingFaceProvider } from './providers/huggingface.provider';
import { GenerateNotesInput } from './interfaces/generate-notes.input';

@Injectable()
export class LlmService {
  constructor(private hfProvider: HuggingFaceProvider) {}

  async generateAssignmentNotes(input: GenerateNotesInput) {
    return this.hfProvider.generateNotes(input);
  }
}