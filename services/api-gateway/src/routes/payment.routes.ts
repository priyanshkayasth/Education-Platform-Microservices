import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { ServicesConfig } from '../config/services.config';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Role } from 'src/common/constants/roles.enum';
import type { Response } from 'express';

@Controller('/api/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentRoutes {
  constructor(
    private readonly proxy: ProxyService,
    readonly servicesConfig: ServicesConfig,
  ) {}

  @Post('create-order')
  @Roles(Role.STUDENT)
  createOrder(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(this.servicesConfig.paymentService, req, res);
  }

  @Post('verify')
  @Roles(Role.STUDENT)
  verifyPayment(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(this.servicesConfig.paymentService, req, res);
  }
}