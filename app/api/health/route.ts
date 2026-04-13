export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type HealthResponse = {
	ok: boolean;
	status: 'healthy' | 'unhealthy';
	database: 'connected' | 'disconnected';
	usersCount?: number;
	timestamp: string;
	latency?: string;
	error?: string;
};

export async function GET() {
	const start = Date.now(); // لحساب سرعة استجابة قاعدة البيانات

	try {
		// محاولة الاتصال والقيام بعملية بسيطة جداً
		// استخدام $queryRaw هو أسرع طريقة للتأكد من أن قاعدة البيانات "حية"
		const [userCount] = await Promise.all([prisma.user.count(), prisma.$queryRaw`SELECT 1`]);

		const end = Date.now();

		return NextResponse.json<HealthResponse>({
			ok: true,
			status: 'healthy',
			database: 'connected',
			usersCount: userCount,
			timestamp: new Date().toISOString(),
			latency: `${end - start}ms`,
		});
	} catch (err: unknown) {
		console.error('[HEALTH_CHECK_ERROR]:', err);

		return NextResponse.json<HealthResponse>(
			{
				ok: false,
				status: 'unhealthy',
				database: 'disconnected',
				timestamp: new Date().toISOString(),
				error: err instanceof Error ? err.message : 'Internal Server Error',
			},
			{ status: 500 }
		);
	}
}
