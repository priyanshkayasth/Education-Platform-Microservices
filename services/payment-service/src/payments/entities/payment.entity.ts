import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  razorpayOrderId: string;

  @Prop()
  razorpayPaymentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  pointsUsed: number;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);