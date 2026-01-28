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
import { servicesConfig } from 'src/config/services.config';

@Controller('/api/auth')
export class AuthRoutes {
  constructor(private readonly proxy: ProxyService) { }

  //  PUBLIC ROUTES (NO GUARDS)

  @Post('login')
  login(
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return this.proxy.forward(servicesConfig.authService, req, res);
  }

  @Post('register')
  register(
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return this.proxy.forward(servicesConfig.authService, req, res);
  }


  //  PROTECTED ROUTES (GUARDED)

  // @Get('me')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  // me(@Req() req) {
  //   return this.proxy.forward(servicesConfig.authService, req);
  // }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req, @Res({ passthrough: true }) res) {
    return this.proxy.forward(servicesConfig.authService, req, res);
  }


  // OPTIONAL: admin/internal access
  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getUserById(
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return this.proxy.forward(servicesConfig.authService, req, res);
  }

  @Post('logout')
  logout(
    @Req() req,
    @Res({ passthrough: true }) res
  ) {
    return this.proxy.forward(servicesConfig.authService, req, res);
  }

}


