import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
console.log('NotificationConsumer file loaded');

@Controller()
export class NotificationConsumer {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern('student.enrolled')
  async handleStudentEnrolled(@Payload() data: any) {
    console.log('Enrollment event received:', data);

    const { studentEmail, courseName } = data;

    await this.emailService.sendEnrollmentConfirmation(
      studentEmail,
      courseName,
    );
  }

  @EventPattern('forgot.password')
async handleForgotPassword(@Payload() data: any) {
  console.log('Forgot password event received:', data);

  const { studentEmail, resetLink, name } = data;

  await this.emailService.sendPasswordResetEmail(
    studentEmail,
    resetLink,
    name,
  );
}
}
