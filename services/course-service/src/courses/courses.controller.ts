// import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
// import { CoursesService } from './courses.service';
// import { CreateCourseDto } from './dto/create-course.dto';
// import { UpdateCourseDto } from './dto/update-course.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/roles.guard';
// import { Roles } from 'src/auth/roles.decorator';
// import { Role } from 'src/common/roles.enum';

import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CoursesService } from "./courses.service";
import { Course } from "./entities/course.entity";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { Roles } from "src/auth/roles.decorator";
import { Role } from "src/common/roles.enum";

// @UseGuards(JwtAuthGuard,RolesGuard)
// @Controller('courses')
// export class CoursesController {
//   constructor(private readonly coursesService: CoursesService) { }

//   @Post()
//   @Roles(Role.INSTRUCTOR)
//   create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
//       console.log('USER:', req.user);
//       return this.coursesService.create(createCourseDto, req.user.id);
//   }

//   @Get()
//   @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
//   findAll() {
//     return this.coursesService.findAll();
//   }

//   @Get(':id')
//   @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
//   findOne(@Param('id') id: string) {
//     return this.coursesService.findOne(id);
//   }

//   @Patch(':id')
//   @Roles(Role.INSTRUCTOR, Role.ADMIN)
//   update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
//     return this.coursesService.update(id, updateCourseDto);
//   }

//   @Delete(':id')
//   @Roles(Role.INSTRUCTOR, Role.ADMIN)
//   remove(@Param('id') id: string) {
//     return this.coursesService.remove(id);
//   }
// }




//


// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Req,
//   BadRequestException,
// } from '@nestjs/common';
// import { CoursesService } from './courses.service';
// import { CreateCourseDto } from './dto/create-course.dto';
// import { UpdateCourseDto } from './dto/update-course.dto';

// @Controller('courses')
// export class CoursesController {
//   constructor(private readonly coursesService: CoursesService) {}

//   @Post()
//   create(@Body() createCourseDto: CreateCourseDto, @Req() req) {
//     const instructorId = req.headers['x-user-id']; // sent by API Gateway
//     // console.log('HEADERS:', req.headers);
//     if (!instructorId) {
//     throw new BadRequestException('Instructor ID missing from headers');
//   }
//     return this.coursesService.create(createCourseDto, instructorId);
//   }

//    @Get("instructor")
//   findByInstructor(@Req() req) {
//     const instructorId = req.headers["x-user-id"];
//     if (!instructorId) {
//       throw new Error("Instructor ID missing from headers");
//     }
//     return this.coursesService.findByInstructor(instructorId);
//   }

//   @Get()
//   findAll() {
//     return this.coursesService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.coursesService.findOne(id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id') id: string,
//     @Body() updateCourseDto: UpdateCourseDto,
//   ) {
//     return this.coursesService.update(id, updateCourseDto);
//   }

//   @Delete(':id')
// remove(@Param('id') id: string) {
//   console.log('DELETE COURSE ID:', id);
//   if (!id) {
//     throw new Error('Course ID is missing');
//   }
//   return this.coursesService.remove(id);
// }

// }



//

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post()
  // async create(@Body() dto: CreateCourseDto, @Req() req):Promise<Course> {
  //   const instructorId = req.headers['x-user-id'];
  //   if (!instructorId) {
  //     throw new BadRequestException('Instructor ID missing');
  //   }
  //   return this.coursesService.create(dto, instructorId);
  // }

  async create(@Body() dto: CreateCourseDto, @Req() req) {
    const userId = req.headers['x-user-id'];
    // const role = req.headers['x-user-role'];

    const role = req.headers['x-user-role']?.toString().toUpperCase();

    if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      throw new ForbiddenException('Only instructors or admins can create courses');
    }
    if (!userId) {
      throw new BadRequestException('User ID missing');
    }

    if (role !== 'INSTRUCTOR' && role !== 'ADMIN') {
      throw new ForbiddenException('Only instructors or admins can create courses');
    }


    return this.coursesService.create(dto, userId);
  }


  @Get('instructor')
  findByInstructor(@Req() req) {
    const instructorId = req.headers['x-user-id'];
    return this.coursesService.findByInstructor(instructorId);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get("stats")
  async getAdminStats() {
    const totalCourses = await this.coursesService.countCourses();
    const recentCourses = await this.coursesService.getRecentCourses(5);

    return {
      totalCourses,
      recentCourses,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req): Promise<Course> {
    const instructorId = req.headers['x-user-id'];
    return this.coursesService.remove(id, instructorId);
  }

  // @UseGuards(JwtAuthGuard,RolesGuard)
  // @Roles(Role.INSTRUCTOR)   

  // @Post(':courseId/lessons/:lessonId/summarize')
  // generateSummary(
  //   @Param('courseId') courseId: string,
  //   @Param('lessonId') lessonId: string,
  //   @Body('youtubeUrl') youtubeUrl: string,
  //    @Body() fullBody: any,
  //   @Req() req,
  // ) {
  //   console.log('Full body:', fullBody);        // Is it empty {}?
  // console.log('youtubeUrl:', youtubeUrl); 
  //   console.log('--- CONTROLLER DEBUG ---');
  // console.log('Headers:', req.headers);
  // console.log('x-user-id:', req.headers['x-user-id']);
  // console.log('x-user-role:', req.headers['x-user-role']);
  //   const instructorId = req.headers['x-user-id'];
  //   return this.coursesService.generateYoutubeSummary(
  //     courseId,
  //     lessonId,
  //     youtubeUrl,
  //     instructorId
  //   );
  // }

  @Patch(':id/update-ai-notes')
  async updateAiNotes(
    @Param('id') id: string,
    @Body() body: { lessons: any[] },
    @Req() req,
  ) {
    console.log('Headers received:', req.headers); // ← add this
    const serviceName = req.headers['x-service-name'];
    console.log('Service name:', serviceName); // ← add this
    if (serviceName !== 'ai-notes-service') {
      throw new ForbiddenException('Not allowed');
    }
    return this.coursesService.updateAiNotes(id, body.lessons);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req): Promise<Course> {
    const instructorId = req.headers['x-user-id'];
    return this.coursesService.update(id, dto, instructorId);
  }



}