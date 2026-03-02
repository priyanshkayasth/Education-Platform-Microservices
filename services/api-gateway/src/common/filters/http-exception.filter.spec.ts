import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  const mockHost = (url: string) => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const response = {
      status,
    };

    const request = {
      url,
    };

    return {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
  };

  it('should format HttpException response correctly', () => {
    const exception = new HttpException(
      { message: 'Unauthorized' },
      401,
    );

    const host = mockHost('/api/protected');

    filter.catch(exception, host);

    const res = host.switchToHttp().getResponse() as any;

    expect(res.status).toHaveBeenCalledWith(401);

    const jsonCallArg = res.status().json.mock.calls[0][0];

    expect(jsonCallArg).toMatchObject({
      statusCode: 401,
      path: '/api/protected',
      error: { message: 'Unauthorized' },
    });

    // timestamp should exist
    expect(jsonCallArg.timestamp).toBeDefined();
  });
});
