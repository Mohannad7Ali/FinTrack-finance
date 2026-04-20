import 'server-only';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // استيراد Pool ضروري هنا
import 'dotenv/config';

// 1. إنشاء الـ Pool الخاص بمكتبة pg
const pool = new Pool({
	connectionString: process.env.DATABASE_URL, // استخدم DATABASE_URL للـ Docker المحلي
});

// 2. ربط الـ Pool بمحول Prisma
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// 3. تشغيل العميل مع المحول
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: ['query', 'warn', 'error'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}
