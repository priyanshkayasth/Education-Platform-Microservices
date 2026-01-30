// import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
// import { CoursesService } from './courses.service';
// import { CreateCourseDto } from './dto/create-course.dto';
// import { UpdateCourseDto } from './dto/update-course.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/roles.guard';
// import { Roles } from 'src/auth/roles.decorator';
// import { Role } from 'src/common/roles.enum';

import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CoursesService } from "./courses.service";

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
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto, @Req() req) {
    const instructorId = req.headers['x-user-id'];
    if (!instructorId) {
      throw new BadRequestException('Instructor ID missing');
    }
    return this.coursesService.create(dto, instructorId);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req) {
    const instructorId = req.headers['x-user-id'];
    return this.coursesService.update(id, dto, instructorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const instructorId = req.headers['x-user-id'];
    return this.coursesService.remove(id, instructorId);
  }



}