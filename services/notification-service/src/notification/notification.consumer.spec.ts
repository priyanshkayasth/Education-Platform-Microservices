import { Test, TestingModule } from '@nestjs/testing';
import { NotificationConsumer } from './notification.consumer';
import { EmailService } from './email.service';

describe('NotificationConsumer (unit)', () => {
  let consumer: NotificationConsumer;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationConsumer,
        {
          provide: EmailService,
          useValue: {
            sendEnrollmentConfirmation: jest.fn(),
          },
        },
      ],
    }).compile();

    consumer = module.get(NotificationConsumer);
    emailService = module.get(EmailService);
  });

  it('should call email service when student.enrolled event received', async () => {
    const payload = {
      studentEmail: 'student@test.com',
      courseName: 'NestJS Mastery',
    };

    await consumer.handleStudentEnrolled(payload);

    expect(
      emailService.sendEnrollmentConfirmation,
    ).toHaveBeenCalledWith(
      'student@test.com',
      'NestJS Mastery',
    );
  });
});
