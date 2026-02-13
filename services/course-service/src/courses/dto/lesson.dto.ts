import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber
} from 'class-validator';

export enum LessonType {
  VIDEO = 'video',
  ASSIGNMENT = 'assignment',
}

export enum VideoProvider {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  S3 = 's3',
}

export class LessonDto {
  @IsString()
  title: string;

  @IsEnum(LessonType)
  type: LessonType;

  // Video fields
  @IsOptional()
  video?: {
    provider: VideoProvider;
    videoId?: string;
    url?: string;
    duration?: number;
  };

  // Assignment fields
  @IsOptional()
  assignment?: {
    instructions: string;
    maxScore?: number;
  };

  

  @IsOptional()
  @IsString()
  videoUrl?: string;

  // AI-generated summary (internal use)
  @IsOptional()
  @IsString()
  summary?: string;
}
