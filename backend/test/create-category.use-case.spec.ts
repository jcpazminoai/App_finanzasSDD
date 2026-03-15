import { Prisma } from '@prisma/client';
import { CreateCategoryUseCase } from '../src/modules/categories/application/use-cases/create-category.use-case';

describe('CreateCategoryUseCase', () => {
  it('creates a custom category for the authenticated user', async () => {
    const prismaService = {
      category: {
        create: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: 'user-1',
          name: 'Freelance',
          kind: 'INCOME',
          icon: 'briefcase',
          isBuiltin: false,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-14T12:00:00Z')
        })
      }
    };

    const useCase = new CreateCategoryUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          name: 'Freelance',
          kind: 'INCOME',
          icon: 'briefcase'
        }
      )
    ).resolves.toMatchObject({
      userId: 'user-1',
      name: 'Freelance',
      kind: 'INCOME',
      isBuiltin: false
    });
  });

  it('maps duplicate categories to a controlled error', async () => {
    const prismaService = {
      category: {
        create: jest.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('duplicate', {
            code: 'P2002',
            clientVersion: '6.19.2'
          })
        )
      }
    };

    const useCase = new CreateCategoryUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        {
          name: 'Freelance',
          kind: 'INCOME'
        }
      )
    ).rejects.toThrow('Ya existe una categoria con ese nombre y tipo para el usuario.');
  });
});
