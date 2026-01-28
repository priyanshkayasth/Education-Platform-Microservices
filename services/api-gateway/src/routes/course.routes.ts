// import { Controller, Req, All, UseGuards, Get, Delete, Patch, Post } from '@nestjs/common';
// import { ProxyService } from '../proxy/proxy.service';
// import { JwtAuthGuard } from '../auth/jwt.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { Role } from '../common/constants/roles.enum';
// import { servicesConfig } from 'src/config/services.config';

// @Controller('/api/courses')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class CourseRoutes {
//     constructor(private readonly proxy: ProxyService) { }

//     @Get()
//     @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
//     getAll(@Req() req) {
//         return this.proxy.forward(servicesConfig.courseService, req);
//     }

//     @Post()
//     @Roles(Role.INSTRUCTOR, Role.ADMIN)
//     create(@Req() req) {
//         return this.proxy.forward(servicesConfig.courseService, req);
//     }


//     @Get(':id')
//     @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
//     getOne(@Req() req) {
//         return this.proxy.forward(servicesConfig.courseService, req);
//     }


//     @Patch(':id')
//     @Roles(Role.INSTRUCTOR, Role.ADMIN)
//     update(@Req() req) {
//         return this.proxy.forward(servicesConfig.courseService, req);
//     }


//     @Delete(':id')
//     @Roles(Role.ADMIN)
//     delete(@Req() req) {
//         return this.proxy.forward(servicesConfig.courseService, req);
//     }
// }



import {
  Controller,
  Req,
  UseGuards,
  Get,
  Delete,
  Patch,
  Post,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { Role } from "src/common/constants/roles.enum";
import { servicesConfig } from "src/config/services.config";
import { ProxyService } from "src/proxy/proxy.service";


@Controller("/api/courses")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseRoutes {
  constructor(private readonly proxy: ProxyService) {}

  @Get()
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  getAll(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }

    // 🔥 ADD THIS (VERY IMPORTANT)
  @Get("instructor")
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  getInstructorCourses(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }


  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  create(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }

  @Get(":id")
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  getOne(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }

  @Patch(":id")
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  update(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }

  @Delete(":id")
  @Roles(Role.ADMIN,Role.INSTRUCTOR)
  delete(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.proxy.forward(servicesConfig.courseService, req, res);
  }
}
