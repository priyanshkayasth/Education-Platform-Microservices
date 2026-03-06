// import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private transporter;
  private logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      
  tls: {
    rejectUnauthorized: false, // 
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


  async sendPasswordResetEmail(
  email: string,
  resetLink: string,
  name: string,
) {
  try {
    await this.transporter.sendMail({
      from: `"EduPlatform" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <h2>Hello ${name}!</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="
          background-color: #6419E6;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          display: inline-block;
          margin: 16px 0;
        ">Reset Password</a>
        <p>This link expires in <b>15 minutes</b>.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  } catch (err) {
    this.logger.error('Password reset email failed', err.message);
  }
}

}


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

// import sgMail from '@sendgrid/mail';

// @Injectable()
// export class EmailService {
//   private logger = new Logger(EmailService.name);

//   constructor() {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
//   }

//   async sendEnrollmentConfirmation(email: string, courseName: string) {
//     this.logger.log(`📨 Sending email to ${email}`);
//     this.logger.log(`FROM=${process.env.SENDGRID_FROM_EMAIL}`);

//     const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <title>Enrollment Confirmation</title>
//   <style>
//     body {
//       background-color: #f6f9fc;
//       font-family: Arial, Helvetica, sans-serif;
//       margin: 0;
//       padding: 0;
//     }
//     .container {
//       max-width: 600px;
//       margin: 30px auto;
//       background: #ffffff;
//       border-radius: 8px;
//       overflow: hidden;
//       box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
//     }
//     .header {
//       background: #4f46e5;
//       color: #ffffff;
//       padding: 20px;
//       text-align: center;
//       font-size: 22px;
//       font-weight: bold;
//     }
//     .content {
//       padding: 30px;
//       color: #333333;
//       font-size: 16px;
//       line-height: 1.6;
//     }
//     .footer {
//       background: #f3f4f6;
//       padding: 15px;
//       text-align: center;
//       font-size: 13px;
//       color: #6b7280;
//     }
//     .button {
//       display: inline-block;
//       margin: 20px 0;
//       padding: 12px 24px;
//       background: #4f46e5;
//       color: #ffffff;
//       text-decoration: none;
//       border-radius: 6px;
//       font-weight: bold;
//     }
//   </style>
// </head>

// <body>
//   <div class="container">
//     <div class="header">
//       LMS Notification
//     </div>

//     <div class="content">
//       <p>Hello 👋,</p>

//       <p>You have been successfully enrolled in the course:</p>

//       <p><b>${courseName}</b></p>

//       <p>
//         We’re excited to have you on board. Start learning anytime and
//         continue your journey with LMS 🚀
//       </p>

//       <a href="#" class="button">Go to Dashboard</a>

//       <p>
//         If you have any questions, just reply to this email.
//       </p>

//       <p>
//         Happy Learning,<br />
//         <b>LMS Team</b>
//       </p>
//     </div>

//     <div class="footer">
//       © ${new Date().getFullYear()} LMS. All rights reserved.
//     </div>
//   </div>
// </body>
// </html>
// `;

//     try {
//       const [response] = await sgMail.send({
//         to: email,
//         from: {
//           email: process.env.SENDGRID_FROM_EMAIL!,
//           name: 'LMS', // 👈 SHOWS LMS IN INBOX
//         },
//         subject: '🎉 Enrollment Confirmed',
//         html,
//       });

//       this.logger.log(`✅ Email sent (status ${response.statusCode})`);
//     } catch (err: any) {
//       this.logger.error('❌ SendGrid email failed');
//       this.logger.error(err.response?.body || err);
//     }
//   }
// }
