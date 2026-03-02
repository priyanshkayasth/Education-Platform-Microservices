import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '../common/constants/roles.enum';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    // helper to mock execution context
    const mockContext = (user: any) =>
    ({
        switchToHttp: () => ({
            getRequest: () => ({
                user,
            }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
    } as unknown as ExecutionContext);

    it('should allow access when no roles are defined', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const context = mockContext({ role: Role.ADMIN });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([Role.ADMIN]);

        const context = mockContext({ role: Role.ADMIN });

        const result = guard.canActivate(context);

        expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([Role.ADMIN]);

        const context = mockContext({ role: Role.STUDENT });

        const result = guard.canActivate(context);

        expect(result).toBe(false);
    });

    it('should deny access when user is missing', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([Role.ADMIN]);

        const context = mockContext(null);

        const result = guard.canActivate(context);

        expect(result).toBe(false);
    });

    it('should deny access when user has no role', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([Role.ADMIN]);

        const context = mockContext({});

        const result = guard.canActivate(context);

        expect(result).toBe(false);
    });
});
