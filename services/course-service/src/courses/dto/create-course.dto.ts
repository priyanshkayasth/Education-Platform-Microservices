import { Type } from 'class-transformer';
import { IsString, IsArray, IsOptional, ValidateNested, IsNumber, Min, IsBoolean } from 'class-validator';
import { LessonDto } from './lesson.dto';
import { Prop } from '@nestjs/mongoose';

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

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
}
