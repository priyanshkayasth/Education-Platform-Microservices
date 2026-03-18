import { IsMongoId, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateAssignmentProgressDto {
  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lessonId: string;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsNumber()
  @Min(1)
  totalLessons: number;
}
