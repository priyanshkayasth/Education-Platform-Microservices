import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { EnrollmentService } from "./enrollment.service";
import { EnrollCourseDto } from "./dto/enroll-course.dto";
import { UpdateVideoProgressDto } from "./dto/video-progress.dto";
import { UpdateAssignmentProgressDto } from "./dto/assignment-progress.dto";

@Controller("enrollments")
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
  ) { }

  // Enroll
  @Post()
  enroll(@Req() req, @Body() dto: EnrollCourseDto) {
    const studentId = req.headers["x-user-id"] as string;

    if (!studentId) {
      throw new BadRequestException(
        "Student ID missing from headers",
      );
    }

    return this.enrollmentService.enrollStudent({
      studentId,
      courseId: dto.courseId,  
      referralCode: dto.referralCode, 
    });
  }

  // Get my enrollments 
  @Get("me")
  getMyEnrollments(@Req() req) {
    const studentId = req.headers["x-user-id"] as string;
    if (!studentId) {
      throw new BadRequestException("Student ID missing");
    }

    return this.enrollmentService.getEnrollmentByStudent(
      studentId,
    );
  }

  // Update video progress
  @Post("progress/video")
  updateVideoProgress(
    @Req() req,
    @Body() dto: UpdateVideoProgressDto,
  ) {
    const studentId = req.headers["x-user-id"] as string;
    if (!studentId) {
      throw new BadRequestException("Student ID missing");
    }

    return this.enrollmentService.updateVideoProgress(
      studentId,
      dto,
    );
  }

  // Update assignment progress
  @Post("progress/assignment")
  updateAssignmentProgress(
    @Req() req,
    @Body() dto: UpdateAssignmentProgressDto,
  ) {
    const studentId = req.headers["x-user-id"] as string;
    if (!studentId) {
      throw new BadRequestException("Student ID missing");
    }
    console.log("ASSIGNMENT DTO RECEIVED:", dto);

    return this.enrollmentService.updateAssignmentProgress(
      studentId,
      dto,
    );
  }

  @Post('enroll-after-payment')
enrollAfterPayment(@Body() body: { studentId: string; courseId: string; pointsUsed: number ,referralCode?:string}) {
  return this.enrollmentService.enrollAfterPayment({
    studentId: body.studentId,
    courseId: body.courseId,
    pointsUsed: body.pointsUsed,
    referralCode:body.referralCode
  });
}
}
