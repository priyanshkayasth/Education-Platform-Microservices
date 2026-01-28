// entities/progress.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Progress extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Enrollment', required: true })
  enrollmentId: Types.ObjectId;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  contentIndex: number;

  @Prop({ required: true })
  status: string;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

ProgressSchema.index(
  { enrollmentId: 1, contentType: 1, contentIndex: 1 },
  { unique: true },
);
