import {
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../common/constants/roles.enum';
import { ServicesConfig } from 'src/config/services.config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Controller('/api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRoutes {
  constructor(private readonly proxy: ProxyService,
      private readonly http: HttpService, 
      private readonly servicesConfig: ServicesConfig,
      

  ) {}

  @Get('users')
  getAllUsers(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {

    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

  @Patch('users/:userId/role')
  updateUserRole(
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {

    return this.proxy.forward(
      this.servicesConfig.authService,
      req,
      res,
    );
  }

  @Get('dashboard')
async getAdminDashboard(@Req() req) {
  const headers = {
    cookie: req.headers.cookie, 
  };

  const [authRes, courseRes] = await Promise.all([
    firstValueFrom(
      this.http.get(
        `${this.servicesConfig.authService}/admin/stats`,
        { headers },
      ),
    ),
    firstValueFrom(
      this.http.get(
        `${this.servicesConfig.courseService}/courses/stats`,
        { headers },
      ),
    ),
  ]);

  return {
    stats: {
      totalUsers: authRes.data.totalUsers,
      students: authRes.data.students,
      instructors: authRes.data.instructors,
      courses: courseRes.data.totalCourses,
    },
    recentUsers: authRes.data.recentUsers,
    recentCourses: courseRes.data.recentCourses,
  };
}

}
