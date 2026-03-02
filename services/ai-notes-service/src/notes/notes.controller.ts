import { Body, Controller, Post } from '@nestjs/common';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post('generate')
  async generateNotes(@Body() course: any) {
    return this.notesService.attachAiNotesToCourse(course);
  }
}