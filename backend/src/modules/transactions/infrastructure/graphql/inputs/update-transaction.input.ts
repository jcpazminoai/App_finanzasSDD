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
export class UpdateTransactionInput {
  @Field()
  @IsString()
  id!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  txnDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(PrismaTransactionType)
  type?: PrismaTransactionType;

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
