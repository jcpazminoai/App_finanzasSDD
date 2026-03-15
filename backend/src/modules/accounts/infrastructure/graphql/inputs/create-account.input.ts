import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';
import { AccountType as PrismaAccountType } from '@prisma/client';

@InputType()
export class CreateAccountInput {
  @Field()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Field()
  @IsEnum(PrismaAccountType)
  type!: PrismaAccountType;

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  initialBalance?: number;
}
