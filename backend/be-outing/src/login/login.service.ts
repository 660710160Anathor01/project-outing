import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

// Adjust this import path to wherever your PrismaService actually lives.
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

export type LoginResult = {
  token: string;
  userName: string;
  role: string;
};

export type ProfileResult = {
  id: string;
  userName: string;
  role: string;
  createdAt: Date;
};

@Injectable()
export class LoginService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { userName: dto.userName },
    });

    // Same generic message whether the username doesn't exist or the
    // password is wrong — don't leak which one it was.
    if (!user) {
      throw new UnauthorizedException("Invalid username");
    }

    const passwordMatches = await bcrypt.compare(dto.pass, user.pass);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid password");
    }

    const payload = {
      sub: user.id,
      userName: user.userName,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      userName: user.userName,
      role: user.role,
    };
  }

  async getProfile(userId: string): Promise<ProfileResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}