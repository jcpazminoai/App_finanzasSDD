import { Field, InputType } from '@nestjs/graphql';
import { CategoryKind } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

@InputType()
export class UpdateCategoryInput {
  @Field()
  @IsString()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(CategoryKind)
  kind?: CategoryKind;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
