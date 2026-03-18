import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Enrollment extends Document {
  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({
    type: [
      {
        lessonId: String,
        watchedSeconds: Number,
        duration: Number,
        percentage: Number,
        submitted: Boolean,
        completed: Boolean,
        lastUpdated: Date,
      },
    ],
    default: [],
  })
  lessonsProgress: {
    lessonId: string;
    watchedSeconds?: number;
    duration?: number;
    percentage?: number;
    submitted?: boolean;
    completed: boolean;
    lastUpdated: Date;
  }[];

  @Prop({ default: 0 })
  overallPercentage: number;
}

export const EnrollmentSchema =
  SchemaFactory.createForClass(Enrollment);


EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
