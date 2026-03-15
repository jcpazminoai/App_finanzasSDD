import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryKind, Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Category } from '@modules/categories/domain/category';

interface CreateCategoryCommand {
  name: string;
  kind: CategoryKind;
  icon?: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: CreateCategoryCommand
  ): Promise<Category> {
    try {
      const category = await this.prismaService.category.create({
        data: {
          userId: authenticatedUser.id,
          name: command.name.trim(),
          kind: command.kind,
          icon: command.icon?.trim() || null,
          isBuiltin: false
        }
      });

      return {
        id: category.id,
        userId: category.userId,
        name: category.name,
        kind: category.kind,
        icon: category.icon,
        isBuiltin: category.isBuiltin,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'Ya existe una categoria con ese nombre y tipo para el usuario.'
        );
      }

      throw error;
    }
  }
}
