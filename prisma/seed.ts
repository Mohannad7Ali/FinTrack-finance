import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const poolConfig = {
	connectionString: process.env.DATABASE_POOLED_URL,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

//إنشاء PrismaClient مع adapter
const prisma = new PrismaClient({ adapter });

const defaultCategories = [
	{ name: 'الراتب', icon: '💰', type: 'INCOME' },
	{ name: 'مكافأة', icon: '🎁', type: 'INCOME' },
	{ name: 'دخل خاص', icon: '📈', type: 'INCOME' },
	{ name: 'طعام ومشروبات', icon: '🍔', type: 'EXPENSE' },
	{ name: 'مواصلات', icon: '🚗', type: 'EXPENSE' },
	{ name: 'إيجار', icon: '🏠', type: 'EXPENSE' },
	{ name: 'فواتير', icon: '💡', type: 'EXPENSE' },
	{ name: 'تسوق', icon: '🛍️', type: 'EXPENSE' },
	{ name: 'صحة', icon: '💊', type: 'EXPENSE' },
	{ name: 'تعليم', icon: '📚', type: 'EXPENSE' },
	{ name: 'ترفيه', icon: '🎬', type: 'EXPENSE' },
	{ name: 'سفر', icon: '✈️', type: 'EXPENSE' },
	{ name: 'هدايا', icon: '🎁', type: 'EXPENSE' },
];

async function main() {
	console.log('Seeding process start  ....');

	for (const cat of defaultCategories) {
		const existing = await prisma.category.findFirst({
			where: {
				name: cat.name,
				userId: null,
			},
		});

		if (!existing) {
			await prisma.category.create({
				data: {
					name: cat.name,
					icon: cat.icon,
					isDefault: true,
					userId: null,
				},
			});
			console.log(`✅ category created successfully: ${cat.name}`);
		} else {
			console.log(`⏭️ category already exists: ${cat.name}`);
		}
	}

	console.log('seeding successfully');
}

main()
	.catch((e) => {
		console.error('seeding failed', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
