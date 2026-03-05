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
}
