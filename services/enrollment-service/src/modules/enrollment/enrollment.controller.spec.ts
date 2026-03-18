// import { Test, TestingModule } from '@nestjs/testing';
// import { EnrollmentController } from './enrollment.controller';

// describe('EnrollmentController', () => {
//   let controller: EnrollmentController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [EnrollmentController],
//     }).compile();

//     controller = module.get<EnrollmentController>(EnrollmentController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

//

import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { BadRequestException } from '@nestjs/common';

describe('EnrollmentController (unit)', () => {
  let controller: EnrollmentController;
  let service: jest.Mocked<EnrollmentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentController],
      providers: [
        {
          provide: EnrollmentService,
          useValue: {
            enrollStudent: jest.fn(),
            getEnrollmentByStudent: jest.fn(),
            updateVideoProgress: jest.fn(),
            updateAssignmentProgress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EnrollmentController>(EnrollmentController);
    service = module.get(EnrollmentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ========================
  // ENROLL
  // ========================
  describe('enroll', () => {
    it('throws if studentId missing', () => {
      const req = { headers: {} };

      expect(() =>
        controller.enroll(req as any, { courseId: 'c1' } as any),
      ).toThrow(BadRequestException);
    });


    it('calls enrollStudent with correct params', async () => {
      service.enrollStudent.mockResolvedValue({ courseId: 'c1' } as any);

      const req = { headers: { 'x-user-id': 's1' } };

      const result = await controller.enroll(
        req as any,
        { courseId: 'c1' } as any,
      );

      expect(service.enrollStudent).toHaveBeenCalledWith({
        studentId: 's1',
        courseId: 'c1',
      });

      expect(result.courseId).toBe('c1');
    });
  });

  // ========================
  // GET MY ENROLLMENTS
  // ========================
  describe('getMyEnrollments', () => {
    it('throws if studentId missing', () => {
      const req = { headers: {} };

      expect(() =>
        controller.getMyEnrollments(req as any),
      ).toThrow(BadRequestException);
    });


    it('calls getEnrollmentByStudent', async () => {
      service.getEnrollmentByStudent.mockResolvedValue([
        { courseId: 'c1' },
      ] as any);

      const req = { headers: { 'x-user-id': 's1' } };

      const result = await controller.getMyEnrollments(req as any);

      expect(service.getEnrollmentByStudent).toHaveBeenCalledWith('s1');
      expect(result.length).toBe(1);
    });
  });

  // ========================
  // UPDATE VIDEO PROGRESS
  // ========================
  describe('updateVideoProgress', () => {
    it('throws if studentId missing', () => {
      const req = { headers: {} };

      expect(() =>
        controller.updateVideoProgress(req as any, {} as any),
      ).toThrow(BadRequestException);
    });


    it('calls updateVideoProgress with correct params', async () => {
      service.updateVideoProgress.mockResolvedValue({} as any);

      const req = { headers: { 'x-user-id': 's1' } };
      const dto = {
        courseId: 'c1',
        lessonId: 'l1',
        watchedSeconds: 20,
        duration: 100,
        totalLessons: 5,
      };

      await controller.updateVideoProgress(req as any, dto as any);

      expect(service.updateVideoProgress).toHaveBeenCalledWith('s1', dto);
    });
  });

  // ========================
  // UPDATE ASSIGNMENT PROGRESS
  // ========================
  describe('updateAssignmentProgress', () => {
    it('throws if studentId missing', () => {
      const req = { headers: {} };

      expect(() =>
        controller.updateAssignmentProgress(req as any, {} as any),
      ).toThrow(BadRequestException);
    });


    it('calls updateAssignmentProgress with correct params', async () => {
      service.updateAssignmentProgress.mockResolvedValue({} as any);

      const req = { headers: { 'x-user-id': 's1' } };
      const dto = {
        courseId: 'c1',
        lessonId: 'l2',
        totalLessons: 5,
      };

      await controller.updateAssignmentProgress(req as any, dto as any);

      expect(service.updateAssignmentProgress).toHaveBeenCalledWith('s1', dto);
    });
  });
});
