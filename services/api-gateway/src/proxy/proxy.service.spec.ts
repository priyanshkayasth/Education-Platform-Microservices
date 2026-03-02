import { ProxyService } from './proxy.service';
import axios from 'axios';
import { HttpException } from '@nestjs/common';

//  Proper axios mock (callable + has isAxiosError)
jest.mock('axios', () => {
  const mockAxios = jest.fn();
  (mockAxios as any).isAxiosError = jest.fn();
  return mockAxios;
});

//  custom type so TS knows axios has isAxiosError
type AxiosMockType = jest.Mock & {
  isAxiosError: jest.Mock;
};

const mockedAxios = axios as unknown as AxiosMockType;

describe('ProxyService (unit)', () => {
  let service: ProxyService;

  beforeEach(() => {
    service = new ProxyService();
    jest.clearAllMocks();
  });

  const makeRes = () => {
    const res: any = {
      setHeader: jest.fn(),
      redirect: jest.fn(),
      send: jest.fn(),
    };

    res.status = jest.fn().mockImplementation(() => res);

    return res;
  };


  it('forwards request correctly', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
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

    const res = makeRes();

    await service.forward('http://auth-service', req, res as any);

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

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true });
  });

  it('forwards set-cookie header', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
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

    const res = makeRes();

    await service.forward('http://user-service', req, res as any);

    expect(res.setHeader).toHaveBeenCalledWith('set-cookie', ['token=abc']);
  });

  it('redirects on 302 response', async () => {
    mockedAxios.mockResolvedValue({
      status: 302,
      headers: {
        location: 'http://redirected',
      },
      data: {},
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/login',
      headers: {},
      query: {},
      user: {},
    };

    const res = makeRes();

    await service.forward('http://auth', req, res as any);

    expect(res.redirect).toHaveBeenCalledWith('http://redirected');
    expect(res.send).not.toHaveBeenCalled();     // optional strictness
    expect(res.status).not.toHaveBeenCalled();   // optional strictness
  });

  it('throws HttpException on axios error', async () => {
    mockedAxios.mockRejectedValue({
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    });

    mockedAxios.isAxiosError.mockReturnValue(true);

    const req = {
      method: 'GET',
      originalUrl: '/api/protected',
      headers: {},
      query: {},
      user: {},
    };

    const res = makeRes();

    await expect(
      service.forward('http://auth-service', req, res as any),
    ).rejects.toThrow(HttpException);
  });

  it('throws generic 500 error for unknown error', async () => {
    mockedAxios.mockRejectedValue(new Error('Boom'));

    mockedAxios.isAxiosError.mockReturnValue(false);

    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      headers: {},
      query: {},
      user: {},
    };

    const res = makeRes();

    await expect(
      service.forward('http://any', req, res as any),
    ).rejects.toThrow(HttpException);
  });

  it('forwards query params correctly', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: {},
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/courses',
      headers: {},
      body: {},
      query: { page: 2, limit: 10 }, // 
      user: {},
    };

    const res = makeRes();

    await service.forward('http://course-service', req as any, res as any);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { page: 2, limit: 10 }, // 👈 verify forwarded
      }),
    );
  });

  it('handles undefined query params', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: {},
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/courses',
      headers: {},
      body: {},
      query: undefined,
      user: {},
    };

    const res = makeRes();

    await service.forward('http://course-service', req as any, res as any);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: undefined, // 
      }),
    );
  });

  it('does not set cookie header when response has no set-cookie', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: {}, // 👈 no set-cookie
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      headers: {},
      query: {},
      user: {},
    };

    const res = makeRes();

    await service.forward('http://test-service', req as any, res as any);

    expect(res.setHeader).not.toHaveBeenCalled(); // 👈 important
  });

  it('does not attach user headers when req.user is undefined', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { ok: true },
      headers: {},
    } as any);

    const req = {
      method: 'GET',
      originalUrl: '/api/test',
      headers: {},
      query: {},
      user: undefined, // 👈 missing branch
    };

    const res = makeRes();

    await service.forward('http://test-service', req as any, res as any);

    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'x-user-id': expect.anything(),
          'x-user-role': expect.anything(),
        }),
      }),
    );
  });

});
