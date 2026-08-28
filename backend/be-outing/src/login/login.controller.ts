import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";

import { LoginService } from "./login.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { AuthenticatedRequest } from "./jwt-auth.guard";

@Controller("login")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  // POST /login — authenticate with userName + pass, returns a JWT + role.
  @Post()
  async login(@Body() dto: LoginDto) {
    return this.loginService.login(dto);
  }

  // GET /login/me — returns the currently authenticated user from the
  // bearer token, so the frontend can verify a stored token is still valid
  // (e.g. on app load) without re-submitting credentials.
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: AuthenticatedRequest) {
    return this.loginService.getProfile(req.user.sub);
  }
}