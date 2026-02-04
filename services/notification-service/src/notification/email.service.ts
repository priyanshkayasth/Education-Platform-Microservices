import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
       tls: {
    rejectUnauthorized: false, 
  },
    pool: true,           // ✅ IMPORTANT
      maxConnections: 1,    // ✅ IMPORTANT
      maxMessages: 10,
    });
  }

  async sendEnrollmentConfirmation(
    email: string,
    courseName: string,
  ) {
    try {
      await this.transporter.sendMail({
        from: `"LMS" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎉 Enrollment Confirmed',
        html: `
          <h2>Enrollment Successful</h2>
          <p>You are enrolled in <b>${courseName}</b>.</p>
          <p>Happy learning 🚀</p>
        `,
      });
    } catch (err) {
      this.logger.error('Email failed', err.message);
    }
  }
}
