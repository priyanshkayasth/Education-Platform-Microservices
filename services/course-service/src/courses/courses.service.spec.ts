// import { Test, TestingModule } from '@nestjs/testing';
// import { CoursesService } from './courses.service';

// describe('CoursesService', () => {
//   let service: CoursesService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [CoursesService],
//     }).compile();

//     service = module.get<CoursesService>(CoursesService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });



//

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseModel: any;

  beforeEach(async () => {
    courseModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getModelToken('Course'),
          useValue: courseModel,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // CREATE COURSE
  // ========================
  describe('create', () => {
    it('should throw if instructorId is missing', async () => {
      await expect(
        service.create({ title: 'NestJS' } as any, ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a course', async () => {
      courseModel.create.mockResolvedValue({ title: 'NestJS' });

      const result = await service.create(
        { title: 'NestJS' } as any,
        'instructor123',
      );

      expect(courseModel.create).toHaveBeenCalledWith({
        title: 'NestJS',
        instructorId: 'instructor123',
        isPublished: false,
      });

      expect(result.title).toBe('NestJS');
    });
  });

  // ========================
  // FIND ALL (STUDENT VIEW)
  // ========================
  describe('findAll', () => {
    it('should return only published courses', async () => {
      courseModel.find.mockResolvedValue([{ title: 'Published Course' }]);

      const result = await service.findAll();

      expect(courseModel.find).toHaveBeenCalledWith({ isPublished: true });
      expect(result.length).toBe(1);
    });
  });

  // ========================
  // FIND ONE
  // ========================
  describe('findOne', () => {
    it('should throw if course not found', async () => {
      courseModel.findById.mockResolvedValue(null);

      await expect(service.findOne('courseId')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return course if found', async () => {
      courseModel.findById.mockResolvedValue({ title: 'Course' });

      const result = await service.findOne('courseId');

      expect(result.title).toBe('Course');
    });
  });

  // ========================
  // UPDATE COURSE
  // ========================
  describe('update', () => {
    it('should throw if course not found', async () => {
      courseModel.findById.mockResolvedValue(null);

      await expect(
        service.update('id', {} as any, 'instructor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if instructor is not owner', async () => {
      courseModel.findById.mockResolvedValue({
        instructorId: 'owner',
      });

      await expect(
        service.update('id', {} as any, 'other'),
      ).rejects.toThrow(ForbiddenException);
    });

    // it('should update course if instructor is owner', async () => {
    //   courseModel.findById.mockResolvedValue({
    //     instructorId: 'owner',
    //   });

    //   courseModel.findByIdAndUpdate.mockResolvedValue({
    //     title: 'Updated Course',
    //   });

    //   const result = await service.update(
    //     'id',
    //     { title: 'Updated Course' } as any,
    //     'owner',
    //   );

    //   expect(courseModel.findByIdAndUpdate).toHaveBeenCalledWith(
    //     'id',
    //     { title: 'Updated Course' },
    //     { new: true },
    //   );

    //   expect(result.title).toBe('Updated Course');
    // });
  });

  // ========================
  // REMOVE COURSE
  // ========================
  describe('remove', () => {
    it('should throw if course not found', async () => {
      courseModel.findById.mockResolvedValue(null);

      await expect(
        service.remove('id', 'instructor'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if instructor is not owner', async () => {
      courseModel.findById.mockResolvedValue({
        instructorId: 'owner',
      });

      await expect(
        service.remove('id', 'other'),
      ).rejects.toThrow(ForbiddenException);
    });

    // it('should delete course if instructor is owner', async () => {
    //   courseModel.findById.mockResolvedValue({
    //     instructorId: 'owner',
    //   });

    //   courseModel.findByIdAndDelete.mockResolvedValue({ deleted: true });

    //   const result = await service.remove('id', 'owner');

    //   expect(courseModel.findByIdAndDelete).toHaveBeenCalledWith('id');
    //   expect(result.deleted).toBe(true);
    // });
  });

  // ========================
  // FIND BY INSTRUCTOR
  // ========================
  describe('findByInstructor', () => {
    it('should return instructor courses', async () => {
      courseModel.find.mockResolvedValue([{ title: 'Course' }]);

      const result = await service.findByInstructor('instructor123');

      expect(courseModel.find).toHaveBeenCalledWith({
        instructorId: 'instructor123',
      });

      expect(result.length).toBe(1);
    });
  });

  // ========================
  // COUNT COURSES
  // ========================
  describe('countCourses', () => {
    it('should return total course count', async () => {
      courseModel.countDocuments.mockResolvedValue(5);

      const result = await service.countCourses();

      expect(courseModel.countDocuments).toHaveBeenCalled();
      expect(result).toBe(5);
    });
  });

  // ========================
  // GET RECENT COURSES
  // ========================
  describe('getRecentCourses', () => {
    it('should return recent courses', async () => {
      const query = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([
          { title: 'Recent Course' },
        ]),
      };

      courseModel.find.mockReturnValue(query);

      const result = await service.getRecentCourses(3);

      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(query.limit).toHaveBeenCalledWith(3);
      expect(result[0].title).toBe('Recent Course');
    });
  });
});
