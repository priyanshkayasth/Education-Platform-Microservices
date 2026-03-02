import { Injectable } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';

@Injectable()
export class NotesService {
  constructor(private llmService: LlmService) {}

  async attachAiNotesToCourse(courseObj: any) {
    for (let lesson of courseObj.lessons) {
      if (lesson.type === 'assignment' && lesson.assignment) {
        const title = lesson.title;
        const instructions = lesson.assignment.instructions;

        const aiNotes = await this.llmService.generateAssignmentNotes({
          title,
          instructions,
          courseTitle: courseObj.title,
          lessonType: lesson.type,
          difficulty: lesson.assignment?.difficulty || 'beginner',
          studentLevel: 'beginner', // later you can pass from user profile
        });

        lesson.assignment.aiNotes = aiNotes;
        lesson.assignment.aiGeneratedAt = new Date().toISOString();
      }
    }

    return courseObj;
  }
}