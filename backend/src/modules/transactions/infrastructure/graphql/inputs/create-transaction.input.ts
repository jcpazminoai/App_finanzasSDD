import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';
import { TransactionType as PrismaTransactionType } from '@prisma/client';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsString()
  accountId!: string;

  @Field()
  @IsString()
  categoryId!: string;

  @Field()
  @IsDateString()
  txnDate!: string;

  @Field(() => Float)
  @IsNumber({ maxDecimalPlaces: 2 })
  amount!: number;

  @Field()
  @IsEnum(PrismaTransactionType)
  type!: PrismaTransactionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(1)
  transferAccountId?: string;
}
