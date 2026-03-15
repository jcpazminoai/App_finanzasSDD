-- AlterEnum
ALTER TYPE "CategoryKind" ADD VALUE 'TRANSFER';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currency" SET DEFAULT 'COP';
