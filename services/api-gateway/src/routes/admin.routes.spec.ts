import { Test, TestingModule } from '@nestjs/testing';
import { AdminRoutes } from './admin.routes';
import { ProxyService } from '../proxy/proxy.service';
import { HttpService } from '@nestjs/axios';
import { ServicesConfig } from 'src/config/services.config';
import { of } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';

describe('AdminRoutes', () => {
  let controller: AdminRoutes;
  let proxyService: ProxyService;
  let httpService: HttpService;
  let servicesConfig: ServicesConfig;

  const mockProxyService = {
    forward: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockServicesConfig = {
    authService: 'http://auth-service',
    courseService: 'http://course-service',
  };

 beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AdminRoutes],
    providers: [
      { provide: ProxyService, useValue: mockProxyService },
      { provide: HttpService, useValue: mockHttpService },
      { provide: ServicesConfig, useValue: mockServicesConfig },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  controller = module.get<AdminRoutes>(AdminRoutes);
  proxyService = module.get<ProxyService>(ProxyService);
  httpService = module.get<HttpService>(HttpService);
  servicesConfig = module.get<ServicesConfig>(ServicesConfig);
});

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should forward request to auth service', async () => {
      const req = { headers: {} };
      const res = {};

      mockProxyService.forward.mockResolvedValue('users');

      const result = await controller.getAllUsers(req, res);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.authService,
        req,
        res,
      );
      expect(result).toBe('users');
    });
  });

  describe('updateUserRole', () => {
    it('should forward patch request to auth service', async () => {
      const req = { params: { userId: '123' }, body: { role: 'ADMIN' } };
      const res = {};

      mockProxyService.forward.mockResolvedValue('updated');

      const result = await controller.updateUserRole(req, res);

      expect(proxyService.forward).toHaveBeenCalledWith(
        servicesConfig.authService,
        req,
        res,
      );
      expect(result).toBe('updated');
    });
  });

  describe('getAdminDashboard', () => {
    it('should return combined dashboard data', async () => {
      const req = {
        headers: {
          cookie: 'jwt=token',
        },
      };

      mockHttpService.get
        .mockReturnValueOnce(
          of({
            data: {
              totalUsers: 10,
              students: 6,
              instructors: 4,
              recentUsers: ['u1', 'u2'],
            },
          }),
        )
        .mockReturnValueOnce(
          of({
            data: {
              totalCourses: 5,
              recentCourses: ['c1', 'c2'],
            },
          }),
        );

      const result = await controller.getAdminDashboard(req);

      expect(httpService.get).toHaveBeenCalledTimes(2);

      expect(result).toEqual({
        stats: {
          totalUsers: 10,
          students: 6,
          instructors: 4,
          courses: 5,
        },
        recentUsers: ['u1', 'u2'],
        recentCourses: ['c1', 'c2'],
      });
    });
  });
});