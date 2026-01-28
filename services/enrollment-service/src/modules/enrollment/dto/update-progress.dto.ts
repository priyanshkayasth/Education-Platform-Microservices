import { IsEnum, IsMongoId, IsNumber } from 'class-validator';
import { ProgressStatus } from '../enums/progress-status.enum';
import { ContentType } from '../enums/content-type.enum';

export class UpdateProgressDto {
  @IsMongoId()
  enrollmentId: string;

  @IsEnum(ContentType)
  contentType: ContentType;

  @IsNumber()
  contentIndex: number;

  @IsEnum(ProgressStatus)
  status: ProgressStatus;
}
