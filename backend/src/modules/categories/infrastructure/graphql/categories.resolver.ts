import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateCategoryUseCase } from '@modules/categories/application/use-cases/create-category.use-case';
import { DeleteCategoryUseCase } from '@modules/categories/application/use-cases/delete-category.use-case';
import { ListCategoriesUseCase } from '@modules/categories/application/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '@modules/categories/application/use-cases/update-category.use-case';
import { AuthenticatedUser } from '@modules/auth/domain/auth-session';
import { CurrentUser } from '@modules/auth/infrastructure/graphql/decorators/current-user.decorator';
import { GqlAuthGuard } from '@modules/auth/infrastructure/graphql/guards/gql-auth.guard';
import { CategoryType } from './category.type';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';

@Resolver(() => CategoryType)
@UseGuards(GqlAuthGuard)
export class CategoriesResolver {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase
  ) {}

  @Query(() => [CategoryType], { name: 'categories' })
  async categories(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryType[]> {
    return this.listCategoriesUseCase.execute(user);
  }

  @Mutation(() => CategoryType, { name: 'createCategory' })
  async createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: CreateCategoryInput
  ): Promise<CategoryType> {
    return this.createCategoryUseCase.execute(user, input);
  }

  @Mutation(() => CategoryType, { name: 'updateCategory' })
  async updateCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Args('input') input: UpdateCategoryInput
  ): Promise<CategoryType> {
    return this.updateCategoryUseCase.execute(user, input);
  }

  @Mutation(() => Boolean, { name: 'deleteCategory' })
  async deleteCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Args('categoryId') categoryId: string
  ): Promise<boolean> {
    return this.deleteCategoryUseCase.execute(user, categoryId);
  }
}
