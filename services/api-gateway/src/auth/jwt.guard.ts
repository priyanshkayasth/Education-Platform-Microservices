// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
// import { JwtService } from "@nestjs/jwt";
// import { Observable } from "rxjs";

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//     constructor(private readonly JwtService:JwtService){}

//     canActivate(context: ExecutionContext): boolean {
//         const request=context.switchToHttp().getRequest()
//         const authHeader=request.headers['authorization']
//         if(!authHeader){
//             throw new UnauthorizedException('Missing Authorization Header')
//         }

//         const token=authHeader.split(' ')[1]
//         if(!token){
//             throw new UnauthorizedException('Invalid Authorization format')
//         }
//         try {
//             const payload=this.JwtService.verify(token)
//             request.user={
//                 userId:payload.id,
//                 role:payload.role
//             }
//             return true
//         } catch (error) {
//             throw new UnauthorizedException('Invalid or expired token')
//         }
//     }
// }


import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        //  console.log("HEADERS:", request.headers);
        //   console.log("COOKIES:", request.cookies);

        //  READ JWT FROM COOKIE
        const token = request.cookies?.access_token;
        //   console.log("TOKEN:", token);

        if (!token) {
            throw new UnauthorizedException("Unauthorized");
        }

        try {
            const payload = this.jwtService.verify(token);

            // attach user for downstream services
            request.user = {
                // userId: payload.id,
                userId: payload.userId,
                role: payload.role,
                email: payload.email, //  NOW TYPE-SAFE

            };

            return true;
        } catch {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}
