import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { Role } from '../common/constants/roles.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user: any) => ({
    getHandler: () => {},
    getClass: () => {},
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  });

  it('should allow access when no roles defined', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);

    const result = guard.canActivate(mockContext({ role: Role.STUDENT }) as any);
    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.INSTRUCTOR]);

    const result = guard.canActivate(mockContext({ role: Role.INSTRUCTOR }) as any);
    expect(result).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.INSTRUCTOR]);

    const result = guard.canActivate(mockContext({ role: Role.STUDENT }) as any);
    expect(result).toBe(false);
  });

  it('should deny access when user is missing', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.ADMIN]);

    const result = guard.canActivate(mockContext(null) as any);
    expect(result).toBe(false);
  });

  it('should allow ADMIN when multiple roles required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([Role.INSTRUCTOR, Role.ADMIN]);

    const result = guard.canActivate(mockContext({ role: Role.ADMIN }) as any);
    expect(result).toBe(true);
  });
});