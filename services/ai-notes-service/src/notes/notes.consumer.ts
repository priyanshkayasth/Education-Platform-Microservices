import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotesService } from './notes.service';
import axios from 'axios';

@Controller()
export class NotesConsumer {
  constructor(private notesService: NotesService) {}

  @EventPattern('course.lesson.created')
  async handleCourseCreated(@Payload() data: any) {
    const { courseId, course } = data;

    console.log('Received event from Course Service:', courseId);

    //  generate AI notes
    const updatedCourse = await this.notesService.attachAiNotesToCourse(course);

    //  call Course Service to update DB
    await axios.patch(
      `http://localhost:3002/courses/${courseId}/update-ai-notes`,
      { lessons: updatedCourse.lessons },
      {
        headers: {
          'x-service-name': 'ai-notes-service',
        },
      }
    );
  }
}