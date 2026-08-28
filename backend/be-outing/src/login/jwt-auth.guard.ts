import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  import { JwtService } from "@nestjs/jwt";
  import type { Request } from "express";
  
  export type AuthenticatedRequest = Request & {
    user: { sub: string; userName: string; role: string };
  };
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();
  
      const authHeader = request.headers["authorization"];
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing or invalid Authorization header");
      }
  
      const token = authHeader.slice("Bearer ".length);
  
      try {
        const payload = await this.jwtService.verifyAsync(token);
        request.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException("Invalid or expired token");
      }
    }
  }