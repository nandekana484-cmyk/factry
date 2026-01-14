import { PrismaClient } from '@prisma/client'

// PrismaClientのグローバルインスタンスを定義
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// 開発環境でホットリロード時にPrismaClientが複数作成されるのを防ぐ
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
