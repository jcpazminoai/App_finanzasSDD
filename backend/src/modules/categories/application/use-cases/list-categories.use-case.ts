import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { Category } from '@modules/categories/domain/category';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(authenticatedUser: AuthenticatedUser): Promise<Category[]> {
    const categories = await this.prismaService.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: authenticatedUser.id }]
      },
      orderBy: [{ isBuiltin: 'desc' }, { kind: 'asc' }, { name: 'asc' }]
    });

    return categories.map((category) => ({
      id: category.id,
      userId: category.userId,
      name: category.name,
      kind: category.kind,
      icon: category.icon,
      isBuiltin: category.isBuiltin,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
  }
}
