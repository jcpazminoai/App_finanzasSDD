import { UpdateCategoryUseCase } from '../src/modules/categories/application/use-cases/update-category.use-case';

describe('UpdateCategoryUseCase', () => {
  it('updates a custom category owned by the user', async () => {
    const prismaService = {
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: 'user-1',
          name: 'Vieja',
          kind: 'EXPENSE',
          icon: null,
          isBuiltin: false
        }),
        update: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: 'user-1',
          name: 'Nueva',
          kind: 'INCOME',
          icon: 'star',
          isBuiltin: false,
          createdAt: new Date('2026-03-14T12:00:00Z'),
          updatedAt: new Date('2026-03-15T12:00:00Z')
        })
      }
    };

    const useCase = new UpdateCategoryUseCase(prismaService as never);

    await expect(
      useCase.execute(
        { id: 'user-1', email: 'user@example.com' },
        { id: 'category-1', name: 'Nueva', kind: 'INCOME', icon: 'star' }
      )
    ).resolves.toMatchObject({
      id: 'category-1',
      name: 'Nueva',
      kind: 'INCOME'
    });
  });
});
