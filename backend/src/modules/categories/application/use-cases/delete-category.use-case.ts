import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    authenticatedUser: AuthenticatedUser,
    categoryId: string
  ): Promise<boolean> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        userId: authenticatedUser.id
      },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true
          }
        }
      }
    });

    if (!category) {
      throw new BadRequestException(
        'La categoria seleccionada no existe o no pertenece al usuario.'
      );
    }

    if (category.isBuiltin) {
      throw new BadRequestException('No se puede eliminar una categoria base.');
    }

    if (category._count.transactions > 0 || category._count.budgets > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoria con movimientos o presupuestos asociados.'
      );
    }

    await this.prismaService.category.delete({
      where: {
        id: category.id
      }
    });

    return true;
  }
}
