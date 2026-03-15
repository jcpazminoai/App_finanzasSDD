import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';

@InputType()
export class TransactionsFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  to?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accountId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
