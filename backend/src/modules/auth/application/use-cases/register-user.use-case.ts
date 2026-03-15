import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthSession, AuthUser } from '@modules/auth/domain/auth-session';
import { PasswordService } from '@modules/auth/infrastructure/security/password.service';
import { TokenService } from '@modules/auth/infrastructure/security/token.service';

interface RegisterUserCommand {
  name: string;
  email: string;
  password: string;
  currency?: string;
  locale?: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService
  ) {}

  async execute(command: RegisterUserCommand): Promise<AuthSession> {
    const normalizedEmail = command.email.trim().toLowerCase();
    const passwordHash = this.passwordService.hash(command.password);
    const refreshToken = this.tokenService.generateRefreshToken();

    try {
      const user = await this.prismaService.user.create({
        data: {
          name: command.name.trim(),
          email: normalizedEmail,
          passwordHash,
          currency: command.currency?.trim().toUpperCase() || 'COP',
          locale: command.locale?.trim() || 'es-CO',
          sessions: {
            create: {
              refreshToken
            }
          }
        }
      });

      return this.buildSession(user, refreshToken);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('El correo ya esta registrado.');
      }

      throw error;
    }
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
