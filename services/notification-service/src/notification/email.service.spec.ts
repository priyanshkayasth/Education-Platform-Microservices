import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService (unit)', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    sendMailMock = jest.fn().mockResolvedValue(true);

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    service = new EmailService();
  });

  it('should send enrollment confirmation email', async () => {
    await service.sendEnrollmentConfirmation(
      'test@example.com',
      'NestJS Course',
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: '🎉 Enrollment Confirmed',
      }),
    );
  });

  it('should catch and log errors', async () => {
    sendMailMock.mockRejectedValue(new Error('SMTP failed'));

    const loggerSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation();

    await service.sendEnrollmentConfirmation(
      'test@example.com',
      'NestJS Course',
    );

    expect(loggerSpy).toHaveBeenCalled();
  });
});
