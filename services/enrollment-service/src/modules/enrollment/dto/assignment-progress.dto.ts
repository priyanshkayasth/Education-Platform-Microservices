import { IsMongoId, IsNumber, IsOptional } from "class-validator";

export class UpdateAssignmentProgressDto {
  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lessonId: string;

  @IsOptional()
  @IsNumber()
  score?: number;
}
