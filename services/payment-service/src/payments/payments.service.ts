import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    private configService: ConfigService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,

      
    });
   
  }

  // CREATE ORDER
  async createOrder(studentId: string, dto: CreateOrderDto) {
    // Calculate discount from points
    // 100 points = 10% discount, max 50%
    const discountPercent = Math.min(50, Math.floor((dto.pointsToUse || 0) / 100) * 10);
    const discount = Math.round((dto.amount * discountPercent) / 100);
    const finalAmount = dto.amount - discount;

    // Create Razorpay order (amount in paise)
    const order = await this.razorpay.orders.create({
      amount: finalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Save payment record
    await this.paymentModel.create({
      studentId,
      courseId: dto.courseId,
      razorpayOrderId: order.id,
      amount: finalAmount,
      discount,
      pointsUsed: dto.pointsToUse || 0,
      status: PaymentStatus.PENDING,
    });

    return {
      orderId: order.id,
      amount: finalAmount,
      discount,
      currency: 'INR',
      keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
    };
  }

  // VERIFY PAYMENT

// VERIFY PAYMENT
async verifyPayment(dto: VerifyPaymentDto) {
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', this.configService.get<string>('RAZORPAY_KEY_SECRET')!)
    .update(dto.razorpayOrderId + '|' + dto.razorpayPaymentId)
    .digest('hex');

  if (expectedSignature !== dto.razorpaySignature) {
    throw new Error('Invalid payment signature');
  }

  // Get payment record to find pointsUsed
  const payment = await this.paymentModel.findOne({
    razorpayOrderId: dto.razorpayOrderId,
  });

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update payment status
  await this.paymentModel.findOneAndUpdate(
    { razorpayOrderId: dto.razorpayOrderId },
    {
      razorpayPaymentId: dto.razorpayPaymentId,
      status: PaymentStatus.SUCCESS,
    },
  );

  // Auto enroll student
  await axios.post(
    `${this.configService.get('ENROLLMENT_SERVICE_URL')}/enrollments/enroll-after-payment`,
    {
      studentId: dto.studentId,
      courseId: dto.courseId,
      pointsUsed: payment.pointsUsed,
    }
  );

  // Deduct points from user if used
if (payment.pointsUsed > 0) {
  await axios.patch(
    `${this.configService.get('AUTH_SERVICE_URL')}/user/deduct-points`,
    {
      studentId: dto.studentId,
      points: payment.pointsUsed,
    }
  );
}

  return { success: true, courseId: dto.courseId };
}
}