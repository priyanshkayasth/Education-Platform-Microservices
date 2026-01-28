// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class Course extends Document {

//   @Prop({ required: true })
//   title: string;

//   @Prop({ required: true })
//   description: string;

//   @Prop({ type: [String], default: [] })
//   videoLinks: string[];

//   @Prop({ type: [String], default: [] })
//   assignments: string[];

//   @Prop({ required: true })
//   instructorId: string;

//   @Prop({ default: false })
//   isPublished: boolean;
// }

// export const CourseSchema = SchemaFactory.createForClass(Course);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LessonType {
  VIDEO = 'video',
  ASSIGNMENT = 'assignment',
}

export enum VideoProvider {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  S3 = 's3',
}

@Schema()
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop({ enum: LessonType, required: true })
  type: LessonType;

  // Video-specific
  @Prop({
    type: {
      provider: { type: String, enum: VideoProvider },
      videoId: String,
      url: String,
      duration: Number,
    },
    required: false,
  })
  video?: {
    provider: VideoProvider;
    videoId?: string;
    url?: string;
    duration?: number;
  };

  // Assignment-specific
  @Prop({
    type: {
      instructions: String,
      maxScore: Number,
    },
    required: false,
  })
  assignment?: {
    instructions: string;
    maxScore?: number;
  };

  @Prop({ default: 0 })
  order: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
  @Prop({ type: [LessonSchema], default: [] })
  lessons: Lesson[];

  @Prop({ required: true })
  instructorId: string;

  @Prop({ default: false })
  isPublished: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

