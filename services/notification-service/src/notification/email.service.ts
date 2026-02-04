import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(EmailService.name);

  async onModuleInit() {
    this.logger.log('🚀 Initializing EmailService');

    // 🔎 ENV CHECK
    this.logger.log(`SMTP_HOST = ${process.env.SMTP_HOST}`);
    this.logger.log(`SMTP_PORT = ${process.env.SMTP_PORT}`);
    this.logger.log(`SMTP_USER = ${process.env.SMTP_USER ? 'SET' : 'MISSING'}`);
    this.logger.log(`SMTP_PASS = ${process.env.SMTP_PASS ? 'SET' : 'MISSING'}`);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true, // ✅ REQUIRED for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 1,
      maxMessages: 10,
      logger: true, // 🔥 Nodemailer internal logs
      debug: true,  // 🔥 SMTP handshake logs
    });

    // 🔥 VERY IMPORTANT: verify connection on startup
    try {
      this.logger.log('🔍 Verifying SMTP connection...');
      await this.transporter.verify();
      this.logger.log('✅ SMTP connection verified');
    } catch (err) {
      this.logger.error('❌ SMTP verification FAILED');
      this.logger.error(err);
    }
  }

  async sendEnrollmentConfirmation(email: string, courseName: string) {
    this.logger.log(`📨 Preparing email for: ${email}`);

    try {
      const info = await this.transporter.sendMail({
        from: `"LMS" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '🎉 Enrollment Confirmed',
        html: `
          <h2>Enrollment Successful</h2>
          <p>You are enrolled in <b>${courseName}</b>.</p>
          <p>Happy learning 🚀</p>
        `,
      });

      // ✅ SUCCESS LOGS
      this.logger.log(`✅ EMAIL SENT`);
      this.logger.log(`MessageId: ${info.messageId}`);
      this.logger.log(`Accepted: ${JSON.stringify(info.accepted)}`);
      this.logger.log(`Rejected: ${JSON.stringify(info.rejected)}`);

    } catch (err) {
      this.logger.error('❌ EMAIL SEND FAILED');
      this.logger.error(err);
    }
  }
}
