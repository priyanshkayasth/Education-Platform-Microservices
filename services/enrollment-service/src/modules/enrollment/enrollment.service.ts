import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Enrollment } from "./entities/enrollment.entity";
import { Model } from "mongoose";
import { UpdateVideoProgressDto } from "./dto/video-progress.dto";
import { UpdateAssignmentProgressDto } from "./dto/assignment-progress.dto";
import { ClientProxy } from "@nestjs/microservices";
import axios from "axios";


@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<Enrollment>,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,

  ) { }

  // Enroll student
  // async enrollStudent(data: { studentId: string; courseId: string  }) {
  //   try {
  //     return await this.enrollmentModel.create({
  //       studentId: data.studentId,
  //       courseId: data.courseId,
  //     });
  //   } catch (error) {
  //     if (error.code === 11000) {
  //       throw new ConflictException("Student already enrolled");
  //     }
  //     throw error;
  //   }
  // }

  //Working for points

  //   async enrollStudent(data: { studentId: string; courseId: string; referralCode?: string }) {
  //   try {
  //     const enrollment = await this.enrollmentModel.create({
  //       studentId: data.studentId,
  //       courseId: data.courseId,
  //     });

  //     // If referral code exists, emit event to award points

  // // In enrollStudent method
  // if (data.referralCode) {
  //   try {
  //     await axios.patch('http://localhost:3001/user/referral/award-points', {
  //       referralCode: data.referralCode,
  //       points: 10,
  //     });
  //     console.log('Points awarded for referral code:', data.referralCode);
  //   } catch (err) {
  //     console.error('Failed to award referral points:', err.message);
  //     // Don't throw - enrollment should still succeed even if points fail
  //   }
  // }

  //     return enrollment;
  //   } catch (error) {
  //     if (error.code === 11000) {
  //       throw new ConflictException("Student already enrolled");
  //     }
  //     throw error;
  //   }
  // }

  //payment


  async enrollStudent(data: { studentId: string; courseId: string; referralCode?: string }) {
    try {
      // Check if course is free or paid
      const courseRes = await axios.get(
        `${process.env.COURSE_SERVICE_URL}/courses/${data.courseId}`
      );
      const course = courseRes.data;

      if (!course.isFree && course.price > 0) {
        throw new BadRequestException('This is a paid course. Please complete payment first.');
      }

      const enrollment = await this.enrollmentModel.create({
        studentId: data.studentId,
        courseId: data.courseId,
      });

      if (data.referralCode) {
        try {
          await axios.patch('http://localhost:3001/user/referral/award-points', {
            referralCode: data.referralCode,
            points: 10,
          });
        } catch (err) {
          console.error('Failed to award referral points:', err.message);
        }
      }

      return enrollment;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException("Student already enrolled");
      }
      throw error;
    }
  }


  async enrollAfterPayment(data: { studentId: string; courseId: string; pointsUsed: number }) {
  try {
    const enrollment = await this.enrollmentModel.create({
      studentId: data.studentId,
      courseId: data.courseId,
    });

    // Deduct points if used
    if (data.pointsUsed > 0) {
      try {
        await axios.patch('http://localhost:3001/user/referral/award-points', {
          studentId: data.studentId,
          points: -data.pointsUsed, // negative to deduct
        });
      } catch (err) {
        console.error('Failed to deduct points:', err.message);
      }
    }

    return enrollment;
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictException("Student already enrolled");
    }
    throw error;
  }
}

  // Get enrollments by student
  async getEnrollmentByStudent(studentId: string) {
    return this.enrollmentModel.find({ studentId });
  }

  // VIDEO PROGRESS
  async updateVideoProgress(
    studentId: string,
    dto: UpdateVideoProgressDto,
  ) {
    const enrollment = await this.enrollmentModel.findOne({
      studentId,
      courseId: dto.courseId,
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    const percentage = Math.min(
      100,
      Math.round((dto.watchedSeconds / dto.duration) * 100),
    );

    const completed = percentage >= 90;

    const existing =
      enrollment.lessonsProgress.find(
        (p) => p.lessonId === dto.lessonId,
      );

    if (existing) {
      existing.watchedSeconds = Math.max(
        existing.watchedSeconds ?? 0,
        dto.watchedSeconds,
      );
      existing.duration = dto.duration;
      existing.percentage = percentage;
      existing.completed = completed;
      existing.lastUpdated = new Date();
    } else {
      enrollment.lessonsProgress.push({
        lessonId: dto.lessonId,
        watchedSeconds: dto.watchedSeconds,
        duration: dto.duration,
        percentage,
        completed,
        lastUpdated: new Date(),
      });
    }

    // Calculate overall percentage based on TOTAL course lessons
    const completedCount = enrollment.lessonsProgress.filter(
      (p) => p.completed,
    ).length;

    enrollment.overallPercentage = Math.min(
      100,
      Math.round((completedCount / dto.totalLessons) * 100)
    );

    return enrollment.save();
  }

  // ASSIGNMENT PROGRESS
  async updateAssignmentProgress(
    studentId: string,
    dto: UpdateAssignmentProgressDto,
  ) {
    const enrollment = await this.enrollmentModel.findOne({
      studentId,
      courseId: dto.courseId,
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    const existing =
      enrollment.lessonsProgress.find(
        (p) => p.lessonId === dto.lessonId,
      );

    if (existing) {
      existing.submitted = true;
      existing.completed = true;
      existing.lastUpdated = new Date();
    } else {
      enrollment.lessonsProgress.push({
        lessonId: dto.lessonId,
        submitted: true,
        completed: true,
        lastUpdated: new Date(),
      });
    }

    // Calculate overall percentage based on TOTAL course lessons
    const completedCount = enrollment.lessonsProgress.filter(
      (p) => p.completed,
    ).length;

    enrollment.overallPercentage = Math.min(
      100,
      Math.round((completedCount / dto.totalLessons) * 100)
    );

    return enrollment.save();
  }
}
