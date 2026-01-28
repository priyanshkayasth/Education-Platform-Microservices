import { IsMongoId, IsNumber, Min } from "class-validator";

export class UpdateVideoProgressDto {
  @IsMongoId()
  courseId: string;

  @IsMongoId()
  lessonId: string;

  @IsNumber()
  @Min(0)
  watchedSeconds: number;

  @IsNumber()
  @Min(1)
  duration: number;
}
