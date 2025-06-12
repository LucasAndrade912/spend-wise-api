/*
  Warnings:

  - The values [CORRENTO] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('POUPANCA', 'CORRENTE', 'SALARIO');
ALTER TABLE "Account" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Account" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "AccountType_old";
ALTER TABLE "Account" ALTER COLUMN "type" SET DEFAULT 'POUPANCA';
COMMIT;
