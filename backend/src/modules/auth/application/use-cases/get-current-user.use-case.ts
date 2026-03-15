import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthUser, AuthenticatedUser } from '@modules/auth/domain/auth-session';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(authenticatedUser: AuthenticatedUser): Promise<AuthUser> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: authenticatedUser.id
      }
    });

    if (
      !user ||
      user.deletedAt !== null ||
      user.email !== authenticatedUser.email
    ) {
      throw new UnauthorizedException('Sesion invalida.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      locale: user.locale
    };
  }
}
