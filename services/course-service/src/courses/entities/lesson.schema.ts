import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop({
    type: {
      provider: { type: String, enum: VideoProvider },
      videoId: String,
      url: String,
      duration: Number,
    },
  })
  video?: {
    provider: VideoProvider;
    videoId?: string;
    url?: string;
    duration?: number;
  };

  @Prop({
    type: {
      instructions: String,
      maxScore: Number,
      aiNotes: { type: Object, default: null },       // 
    aiGeneratedAt: { type: String, default: null },  // 
    },
  })
  assignment?: {
    instructions: string;
    maxScore?: number;
     aiNotes?: any;
  aiGeneratedAt?: string;
  };

  // ✅ REQUIRED for your error
  @Prop({ type: String, default: null })
  summary?: string;

  @Prop({ default: 0 })
  order: number;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
