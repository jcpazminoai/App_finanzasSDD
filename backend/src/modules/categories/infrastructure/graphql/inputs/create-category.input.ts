import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';
import { CategoryKind } from '@prisma/client';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Field()
  @IsEnum(CategoryKind)
  kind!: CategoryKind;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
