import { JwtAuthGuard } from './jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as any;

    guard = new JwtAuthGuard(jwtService);
  });

  // helper to mock execution context
  const mockContext = (req: any) => ({
    switchToHttp: () => ({   
      getRequest: () => req,
    }),
  });

  // =============================
  //  1. Valid token from header
  // =============================
  it('should allow request with valid Authorization header token', () => {
    const req: any = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      cookies: {},
    };
    
    (jwtService.verify as jest.Mock).mockReturnValue({
      id: 'user1',
      role: 'USER',
      email: 'test@mail.com',
    });

    const result = guard.canActivate(mockContext(req) as any);

    expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual({
      userId: 'user1',
      role: 'USER',
      email: 'test@mail.com',
    });
    expect(result).toBe(true);
  });

  // =============================
  //  2. Token from cookie fallback
  // =============================
  it('should read token from cookies if no Authorization header', () => {
    const req: any = {
      headers: {},
      cookies: {
        access_token: 'cookie-token',
      },
    };

    (jwtService.verify as jest.Mock).mockReturnValue({
      userId: 'user2',
      role: 'ADMIN',
      email: 'admin@mail.com',
    });

    const result = guard.canActivate(mockContext(req) as any);

    expect(jwtService.verify).toHaveBeenCalledWith('cookie-token');
    expect(req.user.userId).toBe('user2');
    expect(result).toBe(true);
  });

  // =============================
  //  3. No token at all
  // =============================
  it('should throw UnauthorizedException if no token provided', () => {
    const req: any = {
      headers: {},
      cookies: {},
    };

    expect(() => guard.canActivate(mockContext(req) as any)).toThrow(
      UnauthorizedException,
    );
  });

  // =============================
  //  4. Invalid token
  // =============================
  it('should throw UnauthorizedException if token is invalid', () => {
    const req: any = {
      headers: {
        authorization: 'Bearer bad-token',
      },
      cookies: {},
    };

    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid');
    });

    expect(() => guard.canActivate(mockContext(req) as any)).toThrow(
      UnauthorizedException,
    );
  });

  // =============================
  //  5. Authorization header without Bearer
  // =============================
  it('should ignore Authorization header without Bearer prefix and use cookie', () => {
    const req: any = {
      headers: {
        authorization: 'Basic abc123',
      },
      cookies: {
        access_token: 'cookie-token',
      },
    };

    (jwtService.verify as jest.Mock).mockReturnValue({
      id: 'user3',
      role: 'USER',
      email: 'user3@mail.com',
    });

    const result = guard.canActivate(mockContext(req) as any);

    expect(jwtService.verify).toHaveBeenCalledWith('cookie-token');
    expect(result).toBe(true);
  });
});
