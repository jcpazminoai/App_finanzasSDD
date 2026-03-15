import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthSession, AuthUser } from '@modules/auth/domain/auth-session';
import { PasswordService } from '@modules/auth/infrastructure/security/password.service';
import { TokenService } from '@modules/auth/infrastructure/security/token.service';

interface LoginCommand {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(command: LoginCommand): Promise<AuthSession> {
    const normalizedEmail = command.email.trim().toLowerCase();

    const user = await this.prismaService.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (
      !user ||
      user.deletedAt !== null ||
      !this.passwordService.verify(command.password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Credenciales invalidas.');
    }

    const refreshToken = this.tokenService.generateRefreshToken();

    await this.prismaService.userSession.create({
      data: {
        userId: user.id,
        refreshToken
      }
    });

    return this.buildSession(user, refreshToken);
  }

  private buildSession(user: AuthUser, refreshToken: string): AuthSession {
    return {
      accessToken: this.tokenService.generateAccessToken({
        sub: user.id,
        email: user.email
      }),
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        locale: user.locale
      }
    };
  }
}
