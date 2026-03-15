import { DeleteCategoryUseCase } from '../src/modules/categories/application/use-cases/delete-category.use-case';

describe('DeleteCategoryUseCase', () => {
  it('deletes a custom category without dependent records', async () => {
    const prismaService = {
      category: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'category-1',
          userId: 'user-1',
          isBuiltin: false,
          _count: {
            transactions: 0,
            budgets: 0
          }
        }),
        delete: jest.fn().mockResolvedValue(undefined)
      }
    };

    const useCase = new DeleteCategoryUseCase(prismaService as never);

    await expect(
      useCase.execute({ id: 'user-1', email: 'user@example.com' }, 'category-1')
    ).resolves.toBe(true);
  });
});
