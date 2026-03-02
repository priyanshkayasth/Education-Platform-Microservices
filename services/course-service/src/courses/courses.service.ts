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
  Logger,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './entities/course.entity';
import { Model } from 'mongoose';
import { summarizeText } from './utils/ai.util';
import { extractYoutubeVideoId, getYoutubeTranscript } from './utils/youtube.util';
import { Lesson } from './entities/lesson.schema';
import fs from 'fs';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name)

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,


  ) { }

  // CREATE COURSE
  // async create(createCourseDto: CreateCourseDto, instructorId: string) {
  //   if (!instructorId) {
  //     throw new BadRequestException('Instructor ID is required');
  //   }



  //   // (Optional) lesson validation here if needed

  //   return this.courseModel.create({
  //     ...createCourseDto,
  //     instructorId,
  //     isPublished: false,
  //   });
  // }

  async create(createCourseDto: CreateCourseDto, instructorId: string) {
    if (!instructorId) {
      throw new BadRequestException('Instructor ID is required');
    }

    const course = await this.courseModel.create({
      ...createCourseDto,
      instructorId,
      isPublished: false,
    });

    //  EMIT EVENT TO RABBITMQ
    await this.rabbitClient.emit('course.lesson.created', {
      courseId: course._id,
      course,
    });

    this.logger.log(`Event emitted for course ${course._id}`);

    return course;
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


  //


  // async update(
  //   id: string,
  //   dto: UpdateCourseDto,
  //   instructorId: string,
  // ): Promise<Course> {
  //   const course = await this.courseModel.findById(id);

  //   if (!course) {
  //     throw new NotFoundException('Course not found');
  //   }

  //   if (course.instructorId !== instructorId) {
  //     throw new ForbiddenException();
  //   }

  //   const updated = await this.courseModel.findByIdAndUpdate(
  //     id,
  //     dto,
  //     { new: true },
  //   );

  //   return updated!; // safe because not-found already handled
  // }


  //

  async update(id: string, dto: UpdateCourseDto, instructorId: string): Promise<Course> {
    const course = await this.courseModel.findById(id);

    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException();

    const updated = await this.courseModel.findByIdAndUpdate(id, dto, { new: true });

    //  EMIT EVENT AGAIN (lesson updated)
    await this.rabbitClient.emit('course.lesson.created', {
      courseId: updated!._id,
      course: updated,
    });

    this.logger.log(`Update event emitted for course ${updated!._id}`);

    return updated!;
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

  async updateAiNotes(id: string, lessons: any[]): Promise<Course> {
    const updated = await this.courseModel.findByIdAndUpdate(
      id,
      { lessons },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Course not found');
    this.logger.log(`AI notes updated for course ${id}`);
    return updated;
  }

  // async generateYoutubeSummary(
  //   courseId: string,
  //   lessonId: string,
  //   youtubeUrl: string,
  //   instructorId: string
  // ): Promise<{ summary: string; source: "transcript" | "whisper" }> {

  //   // ── 1. Find course ───────────────────────────────────────────────────────
  //   const course = await this.courseModel.findById(courseId);
  //   if (!course) {
  //     throw new NotFoundException("Course not found");
  //   }

  //   // ── 2. Authorization ─────────────────────────────────────────────────────
  //   if (course.instructorId.toString() !== instructorId) {
  //     throw new ForbiddenException("You are not the instructor of this course");
  //   }

  //   // ── 3. Validate YouTube URL ──────────────────────────────────────────────
  //   const videoId = extractYoutubeVideoId(youtubeUrl);
  //   if (!videoId) {
  //     throw new BadRequestException("Invalid YouTube URL");
  //   }

  //   // ── 4. Get transcript (captions first, Whisper as fallback) ──────────────
  //   let transcript: string;
  //   let source: "transcript" | "whisper";

  //   const captionResult = await getYoutubeTranscript(videoId);

  //   if (captionResult.success) {
  //     // ✅ Fast path — use YouTube captions directly
  //     this.logger.log(`[${videoId}] Using YouTube captions (lang: ${captionResult.language})`);
  //     transcript = captionResult.text;
  //     source = "transcript";

  //   } else {
  //     // ⚠️ Captions unavailable — fall back to audio download + Whisper
  //     this.logger.warn(
  //       `[${videoId}] Captions unavailable (${captionResult.reason}), falling back to Whisper`
  //     );

  //     if (captionResult.reason === "invalid_id") {
  //       throw new BadRequestException("Invalid YouTube video ID");
  //     }

  //     let audioPath: string | null = null;

  //     try {
  //       audioPath = await downloadYoutubeAudio(youtubeUrl);
  //       this.logger.log(`[${videoId}] Audio downloaded: ${audioPath}`);

  //       // transcribeWithHF cleans up the file internally in its finally block
  //       transcript = await transcribeWithHF(audioPath);
  //       audioPath = null; // mark as handled so catch block skips cleanup

  //       if (!transcript?.trim()) {
  //         throw new BadRequestException("Whisper returned an empty transcription");
  //       }

  //       source = "whisper";
  //       this.logger.log(`[${videoId}] Whisper transcription complete (${transcript.length} chars)`);

  //     } catch (err) {
  //       // ✅ Clean up audio file if transcribeWithHF threw before doing it
  //       if (audioPath) {
  //         try {
  //           fs.unlinkSync(audioPath);
  //         } catch {
  //           // ignore cleanup errors
  //         }
  //       }

  //       if (
  //         err instanceof BadRequestException ||
  //         err instanceof NotFoundException
  //       ) {
  //         throw err; // rethrow known errors as-is
  //       }

  //       this.logger.error(`[${videoId}] Whisper pipeline failed`, err);
  //       throw new InternalServerErrorException(
  //         "Could not transcribe video audio. Please try again later."
  //       );
  //     }
  //   }

  //   // ── 5. Summarize transcript ──────────────────────────────────────────────
  //   let summary: string;

  //   try {
  //     summary = await summarizeWithHF(transcript);
  //     this.logger.log(`[${videoId}] Summary generated (${summary.length} chars)`);
  //   } catch (err) {
  //     this.logger.error(`[${videoId}] Summarization failed`, err);
  //     throw new InternalServerErrorException(
  //       "Could not summarize transcript. Please try again later."
  //     );
  //   }

  //   // ── 6. Persist to lesson ─────────────────────────────────────────────────
  //   const lesson = course.lessons.id(lessonId);
  //   if (!lesson) {
  //     throw new NotFoundException("Lesson not found");
  //   }

  //   lesson.summary = summary;
  //   await course.save();

  //   return { summary, source };
  // }
}



