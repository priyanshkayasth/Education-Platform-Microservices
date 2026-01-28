import {  IsMongoId, IsNotEmpty, IsUUID } from "class-validator";

export class EnrollCourseDto{
    @IsMongoId()
    @IsNotEmpty()
    courseId:string
}