import { Test, TestingModule } from '@nestjs/testing';
import { CourseRoutes } from './course.routes';
import { ProxyService } from 'src/proxy/proxy.service';
import { ServicesConfig } from 'src/config/services.config';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';

describe('CourseRoutes', () => {
  let controller: CourseRoutes;
  let proxyService: ProxyService;
  let servicesConfig: ServicesConfig;

  const mockProxyService = {
    forward: jest.fn(),
  };

  const mockServicesConfig = {
    courseService: 'http://course-service',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseRoutes],
      providers: [
        { provide: ProxyService, useValue: mockProxyService },
        { provide: ServicesConfig, useValue: mockServicesConfig },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CourseRoutes>(CourseRoutes);
    proxyService = module.get<ProxyService>(ProxyService);
    servicesConfig = module.get<ServicesConfig>(ServicesConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should forward GET /courses request', async () => {
      const req = { headers: {} };
      const res = {};

      mockProxyService.forward.mockResolvedValue('courses');

      const result = await controller.getAll(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('courses');
    });
  });

  describe('getInstructorCourses', () => {
    it('should forward instructor courses request', async () => {
      const req = { headers: {} };
      const res = {};

      mockProxyService.forward.mockResolvedValue('instructor-courses');

      const result = await controller.getInstructorCourses(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('instructor-courses');
    });
  });

  describe('create', () => {
    it('should forward POST create course request', async () => {
      const req = { body: { title: 'Course' } };
      const res = {};

      mockProxyService.forward.mockResolvedValue('created');

      const result = await controller.create(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('created');
    });
  });

  describe('getOne', () => {
    it('should forward GET single course request', async () => {
      const req = { params: { id: '1' } };
      const res = {};

      mockProxyService.forward.mockResolvedValue('course');

      const result = await controller.getOne(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('course');
    });
  });

  describe('update', () => {
    it('should forward PATCH update course request', async () => {
      const req = { params: { id: '1' }, body: { title: 'Updated' } };
      const res = {};

      mockProxyService.forward.mockResolvedValue('updated');

      const result = await controller.update(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should forward DELETE course request', async () => {
      const req = { params: { id: '1' } };
      const res = {};

      mockProxyService.forward.mockResolvedValue('deleted');

      const result = await controller.delete(req, res as any);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );
      expect(result).toBe('deleted');
    });
  });

  describe('summarizeLesson', () => {
    it('should attach headers and forward summarize request', async () => {
      const req: any = {
        params: { courseId: 'c1', lessonId: 'l1' },
        user: { userId: 'user-1', role: 'INSTRUCTOR' },
        headers: {},
        body: {},
      };
      const res = {};
      const body = { text: 'lesson content' };

      mockProxyService.forward.mockResolvedValue('summary');

      const result = await controller.summarizeLesson(
        req,
        res as any,
        body,
      );

      // headers added
      expect(req.headers['x-user-id']).toBe('user-1');
      expect(req.headers['x-user-role']).toBe('INSTRUCTOR');

      // body reattached
      expect(req.body).toEqual(body);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.courseService,
        req,
        res,
      );

      expect(result).toBe('summary');
    });
  });
});