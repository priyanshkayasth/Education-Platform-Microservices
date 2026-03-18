import {
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


@Injectable()
export class EnrollmentService {
  constructor(
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<Enrollment>
  ) { }

  // Enroll student
  async enrollStudent(data: { studentId: string; courseId: string }) {
    try {
      return await this.enrollmentModel.create({
        studentId: data.studentId,
        courseId: data.courseId,
      });
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

    //find student enrollment
    const enrollment = await this.enrollmentModel.findOne({
      studentId,
      courseId: dto.courseId,
    });

    //if enrollment not found

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    //Calculate lesson progress percentage

    const percentage = Math.min(
      100,
      Math.round((dto.watchedSeconds / dto.duration) * 100), //Math.min(100) ensures it never exceeds 100%.
    );

    //If watched >=90 mark lesson completed
    const completed = percentage >= 90;

    //Check if lesson already exists
    const existing =
      enrollment.lessonsProgress.find(
        (p) => p.lessonId === dto.lessonId,
      );

    //If Lesson progress exists -> update
    if (existing) {
      //Progress can not decrese
      existing.watchedSeconds = Math.max(
        existing.watchedSeconds ?? 0,
        dto.watchedSeconds,
      );
      //Update the fields
      existing.duration = dto.duration;
      existing.percentage = percentage;
      existing.completed = completed;
      existing.lastUpdated = new Date();
    } else {
      //if lesson doesnt exist -> create
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

    //Overall Percentage
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
    //Find Student enrollment
    const enrollment = await this.enrollmentModel.findOne({
      studentId,
      courseId: dto.courseId,
    });

    if (!enrollment) {
      throw new NotFoundException("Enrollment not found");
    }

    //if lesson already exists
    const existing =
      enrollment.lessonsProgress.find(
        (p) => p.lessonId === dto.lessonId,
      );

    //If progress exists update
    if (existing) {
      existing.submitted = true;
      existing.completed = true;
      existing.lastUpdated = new Date();
    } else {
      //If not create new entry
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

