// import { Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
// import { JwtAuthGuard } from "src/auth/jwt.guard";
// import { Roles } from "src/auth/roles.decorator";
// import { RolesGuard } from "src/auth/roles.guard";
// import { Role } from "src/common/constants/roles.enum";
// import { servicesConfig } from "src/config/services.config";
// import { ProxyService } from "src/proxy/proxy.service";

// @Controller('/api/enrollments')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class EnrollmentRoutes {
//   constructor(private readonly proxy: ProxyService) {}

//   // student enrolls
//   @Post()
//   @Roles(Role.STUDENT)
//   enroll(@Req() req) {
//     return this.proxy.forward(
//       servicesConfig.enrollmentService,
//       req,
//     );
//   }

//   // instructor/admin see enrollments
//   @Get()
//   @Roles(Role.INSTRUCTOR, Role.ADMIN)
//   getAll(@Req() req) {
//     return this.proxy.forward(
//       servicesConfig.enrollmentService,
//       req,
//     );
//   }
//   // ✅ STUDENT: update progress
//   @Patch('progress')
//   @Roles(Role.STUDENT)
//   updateProgress(@Req() req) {
//     return this.proxy.forward(
//       servicesConfig.enrollmentService,
//       req,
//     );
//   }
// }



import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Res,
  Inject,
} from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "src/auth/jwt.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { Role } from "src/common/constants/roles.enum";
import { ServicesConfig } from "src/config/services.config";
import { ProxyService } from "src/proxy/proxy.service";
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';



@Controller("/api/enrollments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentRoutes {
  constructor(private readonly proxy: ProxyService,
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
      private readonly servicesConfig: ServicesConfig,

  ) {}

  // ✅ STUDENT: enroll
//  @Post()
// @Roles(Role.STUDENT)
// async enroll(
//   @Req() req,
//   @Res({ passthrough: true }) res: Response,
// ) {
//   if (req.user?.id) {
//     req.headers['x-user-id'] = req.user.id;
//   }

//   // 1️⃣ Call enrollment service
//   const enrollment = await this.proxy.forward(
//     servicesConfig.enrollmentService,
//     req,
//     res,
//   );

//   // 2️⃣ Emit notification event
//   this.notificationClient.emit('student.enrolled', {
//     studentEmail: req.user.email,   // ✅ available from auth
//     courseName: req.body.courseName // OR fetch course here
//   });

//   return enrollment;
// }

@Post()
@Roles(Role.STUDENT)
async enroll(
  @Req() req,
  @Res({ passthrough: true }) res: Response,
) {
  // attach student id for enrollment service
  req.headers['x-user-id'] = req.user.userId;

  // 1️⃣ enroll student
  const enrollment = await this.proxy.forward(
    this.servicesConfig.enrollmentService,
    req,
    res,
  );

  // 2️⃣ fetch course name safely
  let courseName = 'your course';

  try {
    const courseRes = await axios.get<{ title: string }>(
      `${this.servicesConfig.courseService}/courses/${req.body.courseId}`,
      {
        headers: {
          cookie: req.headers.cookie, // forward auth if course service needs it
        },
      },
    );

    courseName = courseRes.data?.title ?? courseName;
  } catch (err) {
    console.warn('Course service fetch failed, fallback used');
  }

  // 3️⃣ emit notification
  this.notificationClient.emit('student.enrolled', {
    studentEmail: req.user.email,
    courseName,
  });

  return enrollment;
}




  // ✅ STUDENT: get my enrollments
  @Get("me")
  @Roles(Role.STUDENT)
  getMyEnrollments(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ) {
    if (req.user?.userId) {
      req.headers["x-user-id"] = req.user.userId;
    }

    return this.proxy.forward(
      this.servicesConfig.enrollmentService,
      req,
      res
    );
  }

  // ✅ STUDENT: update VIDEO progress
  @Post("progress/video")
  @Roles(Role.STUDENT)
  updateVideoProgress(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ) {
    if (req.user?.id) {
      req.headers["x-user-id"] = req.user.id;
    }

    return this.proxy.forward(
      this.servicesConfig.enrollmentService,
      req,
      res
    );
  }

  //  STUDENT: update ASSIGNMENT progress
  @Post("progress/assignment")
  @Roles(Role.STUDENT)
  updateAssignmentProgress(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ) {
    if (req.user?.id) {
      req.headers["x-user-id"] = req.user.id;
    }

    return this.proxy.forward(
      this.servicesConfig.enrollmentService,
      req,
      res
    );
  }
}
