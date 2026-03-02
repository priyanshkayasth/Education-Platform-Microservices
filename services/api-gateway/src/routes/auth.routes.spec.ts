import { ProxyService } from "src/proxy/proxy.service";
import { AuthRoutes } from "./auth.routes"
import { ServicesConfig } from "src/config/services.config";
import { Request } from "express";

describe('AuthRoutes', () => {
    let controller: AuthRoutes;
    let proxyService: jest.Mocked<ProxyService>
    let config: ServicesConfig

    beforeEach(() => {
        proxyService = {
            forward: jest.fn()

        } as any;

        config = {
            authService: 'http://auth-service',
        } as any;

        controller = new AuthRoutes(proxyService, config)
    })

    const makeReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
        originalUrl: '/api/auth/test',
        url: '/test',
        query: {},
        ...overrides,
    });

    const makeRes = () => ({})

    //Public Routes

    it('login() should forward request to auth service', () => {
        const req = makeReq;
        const res = makeRes;

        controller.login(req as any, res as any)
        expect(proxyService.forward).toHaveBeenCalledWith('http://auth-service', req, res)
    })


    it('register() should forward request', () => {
        const req = makeReq;
        const res = makeRes;

        controller.register(req as any, res as any)
        expect(proxyService.forward).toHaveBeenCalledWith('http://auth-service', req, res)
    })

    it('OauthLogin() should forward request', () => {
        const req = makeReq()
        const res = makeRes()

        controller.oauthLogin(req as any, res as any)
        expect(proxyService.forward).toHaveBeenCalledWith('http://auth-service', req, res)
    })

    //Google oAuth

    it('google() should rewrite req.url and forward', () => {
        const req = makeReq();
        const res = makeRes();

        controller.google(req as any, res as any)
        expect(req.url).toBe('/auth/google')
        expect(proxyService.forward).toHaveBeenCalledWith('http://auth-service', req, res)
    })

    it('GoogleCallback() should rewrite url with query params', () => {
        const req = makeReq({
            query: { code: '123', state: 'abc' }
        })
        const res = makeRes()
        controller.googleCallback(req as any, res as any)

        expect(req.url).toContain('/auth/google/callback')
        expect(req.url).toContain('code=123')
        expect(req.url).toContain('state=abc')
        expect(proxyService.forward).toHaveBeenCalledWith(
            'http://auth-service',
            req,
            res,
        );
    })

    // -------------------------
    // PROTECTED ROUTES
    // -------------------------

    it('me() should forward request', () => {
        const req = makeReq();
        const res = makeRes();

        controller.me(req as any, res as any);

        expect(proxyService.forward).toHaveBeenCalledWith(
            'http://auth-service',
            req,
            res,
        );
    });

    it('getUserById() should forward request', () => {
        const req = makeReq();
        const res = makeRes();

        controller.getUserById(req as any, res as any);

        expect(proxyService.forward).toHaveBeenCalledWith(
            'http://auth-service',
            req,
            res,
        );
    });

    it('logout() should forward request', () => {
        const req = makeReq();
        const res = makeRes();

        controller.logout(req as any, res as any);

        expect(proxyService.forward).toHaveBeenCalledWith(
            'http://auth-service',
            req,
            res,
        );
    });

    


})