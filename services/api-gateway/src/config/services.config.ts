import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ServicesConfig {
  constructor(private readonly config: ConfigService) {}

  get authService(): string {
    return this.config.getOrThrow<string>('AUTH_SERVICE_URL');
  }

  get courseService(): string {
    return this.config.getOrThrow<string>('COURSE_SERVICE_URL');
  }

  get enrollmentService(): string {
    return this.config.getOrThrow<string>('ENROLLMENT_SERVICE_URL');
  }
  get paymentService(): string {
  return this.config.getOrThrow<string>('PAYMENT_SERVICE_URL');
}
}
