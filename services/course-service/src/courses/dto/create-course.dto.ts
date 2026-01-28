import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { LessonDto } from './lesson.dto';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // videoLinks?: string[];

  // @IsArray()
  // @IsString({ each: true })
  // @IsOptional()
  // assignments?: string[];

   @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  lessons: LessonDto[];
}
