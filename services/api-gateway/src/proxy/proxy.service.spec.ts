import { ProxyService } from './proxy.service';
import axios from 'axios';
import { HttpException } from '@nestjs/common';

jest.mock('axios');

const mockedAxios = axios as jest.MockedFunction<typeof axios>;

describe('ProxyService (unit)', () => {
  let service: ProxyService;

  beforeEach(() => {
    service = new ProxyService();
    jest.clearAllMocks();
  });

  it('forwards request correctly', async () => {
    mockedAxios.mockResolvedValue({
      data: { success: true },
      headers: {},
    } as any);

    const req = {
      method: 'POST',
      originalUrl: '/api/auth/login/',
      headers: {
        host: 'localhost',
        connection: 'keep-alive',
        'content-length': '123',
      },
      body: { email: 'test@test.com' },
      query: {},
      user: { userId: 'u1', role: 'student' },
    };

    const res = {
      setHeader: jest.fn(),
    } as any;

    const result = await service.forward(
      'http://auth-service',
      req,
      res,
    );

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'http://auth-service/auth/login',
        headers: expect.objectContaining({
          'x-user-id': 'u1',
          'x-user-role': 'student',
        }),
        data: { email: 'test@test.com' },
        timeout: 5000,
      }),
    );

    expect(result).toEqual({ success: true });
  });

  it('forwards set-cookie header', async () => {
    mockedAxios.mockResolvedValue({
      data: {},
      headers: {
        'set-cookie': ['token=abc'],
      },
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/me',
      headers: {},
      query: {},
      user: {},
    };

    const res = {
      setHeader: jest.fn(),
    } as any;

    await service.forward('http://user-service', req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'set-cookie',
      ['token=abc'],
    );
  });

  it('throws HttpException on axios error', async () => {
    mockedAxios.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    });

    const req = {
      method: 'GET',
      originalUrl: '/api/protected',
      headers: {},
      query: {},
      user: {},
    };

    const res = {} as any;

    await expect(
      service.forward('http://auth-service', req, res),
    ).rejects.toThrow(HttpException);
  });

  it('throws generic 500 error for unknown error', async () => {
    mockedAxios.mockRejectedValue(new Error('Boom'));

    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      headers: {},
      query: {},
      user: {},
    };

    const res = {} as any;

    await expect(
      service.forward('http://any', req, res),
    ).rejects.toThrow(HttpException);
  });
  
});
