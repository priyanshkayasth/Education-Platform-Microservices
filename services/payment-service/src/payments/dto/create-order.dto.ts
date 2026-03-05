import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  courseId: string;

  @IsNumber()
  @Min(0)
  amount: number;


  @IsOptional()
  @IsString()
referralCode?: string;

  @IsOptional()
  @IsNumber()
  pointsToUse?: number;
}