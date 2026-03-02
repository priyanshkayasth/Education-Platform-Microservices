export interface GenerateNotesInput {
  title: string;
  instructions: string;
  courseTitle?: string;
  lessonType?: 'assignment' | 'theory' | 'video';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
}