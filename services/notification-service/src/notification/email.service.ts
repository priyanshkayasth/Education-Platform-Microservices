// import { Injectable, Logger } from '@nestjs/common';
// import * as nodemailer from 'nodemailer';

import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

// @Injectable()
// export class EmailService {
//   private transporter;
//   private logger = new Logger(EmailService.name);

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT),
//       secure: true,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     pool: true,           // ✅ IMPORTANT
//       maxConnections: 1,    // ✅ IMPORTANT
//       maxMessages: 10,
//     });
//   }

//   async sendEnrollmentConfirmation(
//     email: string,
//     courseName: string,
//   ) {
//     try {
//       await this.transporter.sendMail({
//         from: `"LMS" <${process.env.SMTP_USER}>`,
//         to: email,
//         subject: '🎉 Enrollment Confirmed',
//         html: `
//           <h2>Enrollment Successful</h2>
//           <p>You are enrolled in <b>${courseName}</b>.</p>
//           <p>Happy learning 🚀</p>
//         `,
//       });
//     } catch (err) {
//       this.logger.error('Email failed', err.message);
//     }
//   }
// }


//resend


// @Injectable()
// export class EmailService {
//   private readonly logger = new Logger(EmailService.name);
//   private readonly resend = new Resend(process.env.RESEND_API_KEY);

//   async sendEnrollmentConfirmation(email: string, courseName: string) {
//     this.logger.log(`📨 Sending email via Resend to ${email}`);

//     try {
//       const result = await this.resend.emails.send({
//         from: 'LMS <onboarding@resend.dev>', // sandbox sender
//         to: email,
//         subject: '🎉 Enrollment Confirmed',
//         html: `
//           <h2>Enrollment Successful</h2>
//           <p>You are enrolled in <b>${courseName}</b>.</p>
//           <p>Happy learning 🚀</p>
//         `,
//       });

//       this.logger.log('✅ Email sent via Resend');
//       this.logger.log(JSON.stringify(result));
//     } catch (err) {
//       this.logger.error('❌ Resend email failed');
//       this.logger.error(err);
//     }
//   }
// }



//SendGrid

import  sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!); 
  }

  async sendEnrollmentConfirmation(email: string, courseName: string) {
    this.logger.log(`📨 Sending email to ${email}`);

    try {
      const [response] = await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL!, 
        subject: '🎉 Enrollment Confirmed',
        html: `
          <h2>Enrollment Successful</h2>
          <p>You are enrolled in <b>${courseName}</b>.</p>
          <p>Happy learning 🚀</p>
        `,
      });

      this.logger.log(` Email sent (status ${response.statusCode})`);
    } catch (err: any) {
      this.logger.error(' SendGrid email failed');
      this.logger.error(err.response?.body || err);
    }
  }
}
