import { ListCategoriesUseCase } from '../src/modules/categories/application/use-cases/list-categories.use-case';

describe('ListCategoriesUseCase', () => {
  it('lists builtin and user categories available to the authenticated user', async () => {
    const prismaService = {
      category: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'builtin-1',
            userId: null,
            name: 'Salario',
            kind: 'INCOME',
            icon: 'salary',
            isBuiltin: true,
            createdAt: new Date('2026-03-14T09:00:00Z'),
            updatedAt: new Date('2026-03-14T09:00:00Z')
          },
          {
            id: 'custom-1',
            userId: 'user-1',
            name: 'Freelance',
            kind: 'INCOME',
            icon: 'briefcase',
            isBuiltin: false,
            createdAt: new Date('2026-03-14T10:00:00Z'),
            updatedAt: new Date('2026-03-14T10:00:00Z')
          }
        ])
      }
    };

    const useCase = new ListCategoriesUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'user@example.com' })
    ).resolves.toEqual([
      {
        id: 'builtin-1',
        userId: null,
        name: 'Salario',
        kind: 'INCOME',
        icon: 'salary',
        isBuiltin: true,
        createdAt: new Date('2026-03-14T09:00:00Z'),
        updatedAt: new Date('2026-03-14T09:00:00Z')
      },
      {
        id: 'custom-1',
        userId: 'user-1',
        name: 'Freelance',
        kind: 'INCOME',
        icon: 'briefcase',
        isBuiltin: false,
        createdAt: new Date('2026-03-14T10:00:00Z'),
        updatedAt: new Date('2026-03-14T10:00:00Z')
      }
    ]);
    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ userId: null }, { userId: 'user-1' }]
      },
      orderBy: [{ isBuiltin: 'desc' }, { kind: 'asc' }, { name: 'asc' }]
    });
  });
});
