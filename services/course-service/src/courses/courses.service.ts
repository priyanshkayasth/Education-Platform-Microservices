// import { Injectable } from '@nestjs/common';
// import { CreateCourseDto } from './dto/create-course.dto';
// import { UpdateCourseDto } from './dto/update-course.dto';
// import { InjectModel } from '@nestjs/mongoose';
// import { Course } from './entities/course.entity';
// import { Model } from 'mongoose';

// @Injectable()
// export class CoursesService {
//   constructor(@InjectModel(Course.name) private courseModel:Model<Course>){}
//  async create(createCourseDto: CreateCourseDto,instructorId:string) {
//     return await this.courseModel.create({
//      ...createCourseDto,
//      instructorId
//     })
//   }

//  async findAll() {
//     return await this.courseModel.find()
//   }

//  async findOne(id: string) {
//     return await this.courseModel.findById(id)
//   }

//  async update(id: string, updateCourseDto: UpdateCourseDto) {
//     return await this.courseModel.findByIdAndUpdate(id,updateCourseDto,{new:true})
//  }

//  async remove(id: string) {
//     return await this.courseModel.findByIdAndDelete(id)
//   }
//   async findByInstructor(instructorId: string) {
//   return await this.courseModel.find({ instructorId });
// }

// }



//


import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './entities/course.entity';
import { Model } from 'mongoose';
import { summarizeText } from './utils/ai.util';
import { extractYoutubeVideoId, getYoutubeTranscript } from './utils/youtube.util';
import { Lesson } from './entities/lesson.schema';


@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
  ) {}

  // CREATE COURSE
  async create(createCourseDto: CreateCourseDto, instructorId: string) {
    if (!instructorId) {
      throw new BadRequestException('Instructor ID is required');
    }

    // (Optional) lesson validation here if needed

    return this.courseModel.create({
      ...createCourseDto,
      instructorId,
      isPublished: false,
    });
  }

  // STUDENT VIEW (published courses only)
  async findAll() {
    return this.courseModel.find({ isPublished: true });
  }

  // GET COURSE BY ID
  async findOne(id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  // UPDATE COURSE (OWNER ONLY)
  // async update(
  //   id: string,
  //   updateCourseDto: UpdateCourseDto,
  //   instructorId: string,
  // ) {
  //   const course = await this.courseModel.findById(id);

  //   if (!course) {
  //     throw new NotFoundException('Course not found');
  //   }

  //   if (course.instructorId !== instructorId) {
  //     throw new ForbiddenException('You cannot update this course');
  //   }

  //   return this.courseModel.findByIdAndUpdate(
  //     id,
  //     updateCourseDto,
  //     { new: true },
  //   );
    
  // }

  async update(
  id: string,
  dto: UpdateCourseDto,
  instructorId: string,
): Promise<Course> {
  const course = await this.courseModel.findById(id);

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  if (course.instructorId !== instructorId) {
    throw new ForbiddenException();
  }

  const updated = await this.courseModel.findByIdAndUpdate(
    id,
    dto,
    { new: true },
  );

  return updated!; // safe because not-found already handled
}


  // DELETE COURSE (OWNER ONLY)
  // async remove(id: string, instructorId: string) {
  //   const course = await this.courseModel.findById(id);

  //   if (!course) {
  //     throw new NotFoundException('Course not found');
  //   }

  //   if (course.instructorId !== instructorId) {
  //     throw new ForbiddenException('You cannot delete this course');
  //   }

  //   return this.courseModel.findByIdAndDelete(id);
  // }

  async remove(id: string, instructorId: string): Promise<Course> {
  const course = await this.courseModel.findById(id);

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  if (course.instructorId !== instructorId) {
    throw new ForbiddenException();
  }

  const deleted = await this.courseModel.findByIdAndDelete(id);
  return deleted!;
}


  // INSTRUCTOR DASHBOARD
  async findByInstructor(instructorId: string) {
    return this.courseModel.find({ instructorId });
  }

  async countCourses() {
  return this.courseModel.countDocuments();
}

async getRecentCourses(limit = 5) {
  return this.courseModel
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("title instructor createdAt");
}


// async generateYoutubeSummary(
//   courseId: string,
//   lessonId: string,
//   youtubeUrl: string,
//   instructorId: string,
// ) {
//   // 1️⃣ Find course
//   const course = await this.courseModel.findById(courseId);

//   if (!course) {
//     throw new NotFoundException('Course not found');
//   }

//   // 2️⃣ Instructor authorization
//   if (course.instructorId !== instructorId) {
//     throw new ForbiddenException('Not allowed');
//   }

//   // 3️⃣ Extract YouTube video ID
//   const videoId = extractYoutubeVideoId(youtubeUrl);
//   if (!videoId) {
//     throw new BadRequestException('Invalid YouTube URL');
//   }

//   // 4️⃣ Fetch transcript
//   const transcript = await getYoutubeTranscript(videoId);
//   if (!transcript) {
//     throw new BadRequestException('Transcript not available');
//   }

//   // 5️⃣ Summarize transcript
//   const summary = await summarizeText(transcript);

//   // 6️⃣ Save summary in lesson
//   const lesson = course.lessons.id(lessonId);
//   if (!lesson) {
//     throw new NotFoundException('Lesson not found');
//   }

//   lesson.summary = summary;
//   await course.save();

//   return { summary };
// }



}
