// import { Test, TestingModule } from '@nestjs/testing';
// import { EnrollmentService } from './enrollment.service';


// describe('EnrollmentService', () => {
//   let service: EnrollmentService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [EnrollmentService],
//     }).compile();

//     service = module.get<EnrollmentService>(EnrollmentService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });


//


import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EnrollmentService } from './enrollment.service';
import { Enrollment } from './entities/enrollment.entity';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

type LessonProgress = {
  lessonId: string;
  watchedSeconds?: number;
  duration?: number;
  percentage?: number;
  completed?: boolean;
  submitted?: boolean;
  lastUpdated?: Date;
};

describe('EnrollmentService (unit)', () => {
  let service: EnrollmentService;
  let enrollmentModel: any;

  beforeEach(async () => {
    enrollmentModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        {
          provide: getModelToken(Enrollment.name),
          useValue: enrollmentModel,
        },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================
  // ENROLL STUDENT
  // ========================
  describe('enrollStudent', () => {
    it('should create enrollment successfully', async () => {
      enrollmentModel.create.mockResolvedValue({
        studentId: 's1',
        courseId: 'c1',
      });

      const result = await service.enrollStudent({
        studentId: 's1',
        courseId: 'c1',
      });

      expect(enrollmentModel.create).toHaveBeenCalledWith({
        studentId: 's1',
        courseId: 'c1',
      });
      expect(result.studentId).toBe('s1');
    });

    it('should throw ConflictException on duplicate enrollment', async () => {
      enrollmentModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.enrollStudent({ studentId: 's1', courseId: 'c1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ========================
  // GET ENROLLMENTS BY STUDENT
  // ========================
  describe('getEnrollmentByStudent', () => {
    it('should return enrollments for student', async () => {
      enrollmentModel.find.mockResolvedValue([
        { courseId: 'c1' },
      ]);

      const result = await service.getEnrollmentByStudent('s1');

      expect(enrollmentModel.find).toHaveBeenCalledWith({
        studentId: 's1',
      });
      expect(result.length).toBe(1);
    });
  });

  // ========================
  // UPDATE VIDEO PROGRESS
  // ========================
  describe('updateVideoProgress', () => {
    const dto = {
      courseId: 'c1',
      lessonId: 'l1',
      watchedSeconds: 50,
      duration: 100,
      totalLessons: 5,
    };

    it('should throw if enrollment not found', async () => {
      enrollmentModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateVideoProgress('s1', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add new lesson progress', async () => {
      const enrollment = {
        lessonsProgress: [] as LessonProgress[],
        overallPercentage: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      enrollmentModel.findOne.mockResolvedValue(enrollment);

      await service.updateVideoProgress('s1', dto as any);

      expect(enrollment.lessonsProgress.length).toBe(1);
      expect(enrollment.lessonsProgress[0].lessonId).toBe('l1');
      expect(enrollment.save).toHaveBeenCalled();
    });

    it('should update existing lesson progress', async () => {
      const enrollment = {
        lessonsProgress: [
          {
            lessonId: 'l1',
            watchedSeconds: 20,
            completed: false,
          },
        ] as LessonProgress[],
        overallPercentage: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      enrollmentModel.findOne.mockResolvedValue(enrollment);

      await service.updateVideoProgress('s1', dto as any);

      expect(enrollment.lessonsProgress.length).toBe(1);
      expect(enrollment.lessonsProgress[0].watchedSeconds).toBe(50);
      expect(enrollment.save).toHaveBeenCalled();
    });
  });

  // ========================
  // UPDATE ASSIGNMENT PROGRESS
  // ========================
  describe('updateAssignmentProgress', () => {
    const dto = {
      courseId: 'c1',
      lessonId: 'l2',
      totalLessons: 5,
    };

    it('should throw if enrollment not found', async () => {
      enrollmentModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateAssignmentProgress('s1', dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should add assignment progress if not exists', async () => {
      const enrollment = {
        lessonsProgress: [] as LessonProgress[],
        overallPercentage: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      enrollmentModel.findOne.mockResolvedValue(enrollment);

      await service.updateAssignmentProgress('s1', dto as any);

      expect(enrollment.lessonsProgress.length).toBe(1);
      expect(enrollment.lessonsProgress[0].completed).toBe(true);
      expect(enrollment.save).toHaveBeenCalled();
    });

    it('should update assignment if exists', async () => {
      const enrollment = {
        lessonsProgress: [
          { lessonId: 'l2', completed: false },
        ] as LessonProgress[],
        overallPercentage: 0,
        save: jest.fn().mockResolvedValue(true),
      };

      enrollmentModel.findOne.mockResolvedValue(enrollment);

      await service.updateAssignmentProgress('s1', dto as any);

      expect(enrollment.lessonsProgress.length).toBe(1);
      expect(enrollment.lessonsProgress[0].completed).toBe(true);
      expect(enrollment.save).toHaveBeenCalled();
    });
  });
});


