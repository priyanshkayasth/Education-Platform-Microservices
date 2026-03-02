import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import axios from 'axios';

import { ProxyService } from 'src/proxy/proxy.service';
import { ServicesConfig } from 'src/config/services.config';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { EnrollmentRoutes } from './enrollment.routes';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EnrollmentRoutes', () => {
  let controller: EnrollmentRoutes;
  let proxyService: ProxyService;
  let servicesConfig: ServicesConfig;

  const mockProxyService = {
    forward: jest.fn(),
  };

  const mockNotificationClient = {
    emit: jest.fn(),
  };

  const mockServicesConfig = {
    enrollmentService: 'http://enrollment-service',
    courseService: 'http://course-service',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentRoutes],
      providers: [
        { provide: ProxyService, useValue: mockProxyService },
        { provide: ServicesConfig, useValue: mockServicesConfig },
        { provide: 'NOTIFICATION_SERVICE', useValue: mockNotificationClient },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EnrollmentRoutes>(EnrollmentRoutes);
    proxyService = module.get<ProxyService>(ProxyService);
    servicesConfig = module.get<ServicesConfig>(ServicesConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =====================================================
  //  ENROLL STUDENT
  // =====================================================
  describe('enroll', () => {
    it('should enroll, fetch course title, and emit notification', async () => {
      const req: any = {
        user: {
          userId: 'student-1',
          email: 'student@test.com',
        },
        headers: { cookie: 'jwt=token' },
        body: { courseId: 'course-1' },
      };

      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({ success: true });

      mockedAxios.get.mockResolvedValue({
        data: { title: 'NestJS Course' },
      } as any);

      const result = await controller.enroll(req, res);

      expect(req.headers['x-user-id']).toBe('student-1');

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.enrollmentService,
        req,
        res,
      );

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${servicesConfig.courseService}/courses/course-1`,
        {
          headers: { cookie: req.headers.cookie },
        },
      );

      expect(mockNotificationClient.emit).toHaveBeenCalledWith(
        'student.enrolled',
        {
          studentEmail: 'student@test.com',
          courseName: 'NestJS Course',
        },
      );

      expect(result).toEqual({ success: true });
    });

    it('should fallback if axios fails', async () => {
      const req: any = {
        user: {
          userId: 'student-1',
          email: 'student@test.com',
        },
        headers: { cookie: 'jwt=token' },
        body: { courseId: 'course-1' },
      };

      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({ success: true });
      mockedAxios.get.mockRejectedValue(new Error('network error'));

      const result = await controller.enroll(req, res);

      expect(mockNotificationClient.emit).toHaveBeenCalledWith(
        'student.enrolled',
        {
          studentEmail: 'student@test.com',
          courseName: 'your course',
        },
      );

      expect(result).toEqual({ success: true });
    });

    it('should fallback if course has no title', async () => {
      const req: any = {
        user: {
          userId: 'student-1',
          email: 'student@test.com',
        },
        headers: { cookie: 'jwt=token' },
        body: { courseId: 'course-1' },
      };

      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({ success: true });

      mockedAxios.get.mockResolvedValue({
        data: {}, // no title field
      } as any);

      await controller.enroll(req, res);

      expect(mockNotificationClient.emit).toHaveBeenCalledWith(
        'student.enrolled',
        {
          studentEmail: 'student@test.com',
          courseName: 'your course',
        },
      );
    });
  });

  // =====================================================
  //  GET MY ENROLLMENTS
  // =====================================================
  describe('getMyEnrollments', () => {
    it('should attach header when user exists', async () => {
      const req: any = {
        user: { userId: 'student-1' },
        headers: {},
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue(['data']);

      const result = await controller.getMyEnrollments(req, res);

      expect(req.headers['x-user-id']).toBe('student-1');

      expect(result).toEqual(['data']);
    });

    it('should NOT attach header when user missing', async () => {
      const req: any = {
        headers: {},
        user: undefined,
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue([]);

      await controller.getMyEnrollments(req, res);

      expect(req.headers['x-user-id']).toBeUndefined();
    });
  });

  // =====================================================
  //  VIDEO PROGRESS
  // =====================================================
  describe('updateVideoProgress', () => {
    it('should attach header when user.id exists', async () => {
      const req: any = {
        user: { id: 'student-1' },
        headers: {},
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({ ok: true });

      await controller.updateVideoProgress(req, res);

      expect(req.headers['x-user-id']).toBe('student-1');
    });

    it('should NOT attach header when user.id missing', async () => {
      const req: any = {
        user: {},
        headers: {},
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({});

      await controller.updateVideoProgress(req, res);

      expect(req.headers['x-user-id']).toBeUndefined();
    });
  });

  // =====================================================
  //  ASSIGNMENT PROGRESS
  // =====================================================
  describe('updateAssignmentProgress', () => {
    it('should attach header when user.id exists', async () => {
      const req: any = {
        user: { id: 'student-1' },
        headers: {},
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({ ok: true });

      await controller.updateAssignmentProgress(req, res);

      expect(req.headers['x-user-id']).toBe('student-1');
    });

    it('should NOT attach header when user.id missing', async () => {
      const req: any = {
        user: {},
        headers: {},
      };
      const res = {} as Response;

      mockProxyService.forward.mockResolvedValue({});

      await controller.updateAssignmentProgress(req, res);

      expect(req.headers['x-user-id']).toBeUndefined();
    });
  });
});