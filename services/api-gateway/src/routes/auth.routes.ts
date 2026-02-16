import {
  Controller,
  Req,
  Post,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { ServicesConfig } from 'src/config/services.config';
import { AuthGuard } from '@nestjs/passport';

@Controller('/api/auth')
export class AuthRoutes {
  constructor(
    private readonly proxy: ProxyService,
    private readonly servicesConfig: ServicesConfig,
  ) {}

  // PUBLIC ROUTES

  @Post('login')
  login(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

  @Post('register')
  register(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

 @Get('google')
 @UseGuards(AuthGuard('google'))

google(@Res() res: any) {
  return res.redirect(
    `${this.servicesConfig.authService}/auth/google`
  );
}


@Get('google/callback')
@UseGuards(AuthGuard('google'))

googleCallback(@Res() res: any, @Req() req) {
  const query = new URLSearchParams(req.query as any).toString();

  return res.redirect(
    `${this.servicesConfig.authService}/auth/google/callback?${query}`
  );
}


  // PROTECTED ROUTES

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUserById(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

  @Post('logout')
  logout(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }
}
