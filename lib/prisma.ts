import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

/**
 * 1. إعداد الـ Pool بتكوين مرن للإنتاج
 * نستخدم إعدادات تضمن عدم بقاء الاتصالات "علقة" (Zombie connections)
 */
const poolConfig = {
	connectionString: process.env.DATABASE_POOLED_URL,
	max: process.env.NODE_ENV === 'production' ? 15 : 5, // تقليل العدد لتجنب استهلاك موارد Supabase
	idleTimeoutMillis: 15000, // إغلاق الاتصال الخامل بعد 15 ثانية
	connectionTimeoutMillis: 10000, // وقت انتظار الاتصال قبل الفشل
	maxUses: 5000, // إعادة تدوير الاتصال بعد 5000 استعلام لمنع تسرب الذاكرة
	ssl: { rejectUnauthorized: false }, // مطلوب للاتصال بـ Supabase
};

const pool = new Pool(poolConfig);

// مراقبة أخطاء الـ Pool بشكل صامت في الإنتاج وصاخب في التطوير
pool.on('error', (err) => {
	console.error('🚨 [Prisma Pool Error]:', err);
});

const adapter = new PrismaPg(pool);

/**
 * 2. استخدام Prisma Extensions (الطريقة الحديثة)
 * بدلاً من تعديل الـ Type يدوياً، نستخدم $extends لإضافة وظائف مخصصة
 */
const createPrismaClient = () => {
	return new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	}).$extends({
		model: {
			$allModels: {
				// إضافة دالة إعادة محاولة مدمجة لأي موديل (اختياري)
				async findUniqueWithRetry<T, A>(
					this: T,
					args: Prisma.Args<T, 'findUnique'>
				): Promise<Prisma.Result<T, A, 'findUnique'>> {
					return (this as any).findUnique(args);
				},
			},
		},
	});
};

// إعداد Singleton لضمان عدم إنشاء أكثر من نسخة في Next.js/Fastify
const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * 3. آلية الاتصال المرن (Resilient Connection)
 */
export async function connectWithRetry(retries = 5, delay = 2000) {
	for (let i = 1; i <= retries; i++) {
		try {
			await prisma.$connect();
			console.log('✅ [Database] Connection established successfully.');
			return;
		} catch (error) {
			console.error(`⚠️ [Database] Connection attempt ${i} failed. Retrying in ${delay}ms...`);
			if (i === retries) {
				console.error('❌ [Database] Max retries reached. Critical failure.');
				// هنا لا نغلق التطبيق، بل نترك Prisma يحاول لاحقاً عند أول استعلام
			}
			await new Promise((res) => setTimeout(res, delay));
		}
	}
}

/**
 * 4. الإغلاق النظيف (Graceful Shutdown)
 * مهم جداً في بيئات مثل Docker أو Vercel أو Railway لضمان عدم بقاء اتصالات مفتوحة
 */
const handleShutdown = async (signal: string) => {
	console.log(`\nStopping by ${signal}...`);
	try {
		await prisma.$disconnect();
		await pool.end();
		console.log('🔒 [Database] Disconnected cleanly.');
		process.exit(0);
	} catch (err) {
		console.error('Error during shutdown:', err);
		process.exit(1);
	}
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default prisma;
