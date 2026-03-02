import { IsMongoId, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class EnrollCourseDto {
    @IsMongoId()
    @IsNotEmpty()
    courseId: string

    @IsOptional()
    @IsString()
    referralCode?: string;
}