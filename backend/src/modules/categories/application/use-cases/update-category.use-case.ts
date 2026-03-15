import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryKind, Prisma } from '@prisma/client';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Category } from '@modules/categories/domain/category';

interface UpdateCategoryCommand {
  id: string;
  name?: string;
  kind?: CategoryKind;
  icon?: string | null;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    command: UpdateCategoryCommand
  ): Promise<Category> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: command.id,
        userId: authenticatedUser.id
      }
    });

    if (!category) {
      throw new BadRequestException(
        'La categoria seleccionada no existe o no pertenece al usuario.'
      );
    }

    if (category.isBuiltin) {
      throw new BadRequestException('No se puede modificar una categoria base.');
    }

    try {
      const updated = await this.prismaService.category.update({
        where: {
          id: category.id
        },
        data: {
          name: command.name?.trim() ?? category.name,
          kind: command.kind ?? category.kind,
          icon:
            command.icon === undefined
              ? category.icon
              : command.icon?.trim() || null
        }
      });

      return {
        id: updated.id,
        userId: updated.userId,
        name: updated.name,
        kind: updated.kind,
        icon: updated.icon,
        isBuiltin: updated.isBuiltin,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
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
