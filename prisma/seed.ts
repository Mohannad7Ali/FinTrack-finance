import { prisma } from '../lib/prisma';

const defaultCategories = [
	{ name: 'الراتب', icon: '💰', type: 'INCOME' },
	{ name: 'مكافأة', icon: '🎁', type: 'INCOME' },
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
	// إضافة الفئات العامة (بدون userId)
	for (const cat of defaultCategories) {
		// await prisma.category.upsert({
		// 	where: { userId_name: { userId: 0, name: cat.name } },
		// 	update: {},
		// 	create: {
		// 		name: cat.name,
		// 		icon: cat.icon,
		// 		isDefault: true,
		// 	},
		// });
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
		}
	}
	console.log('✅ Default categories seeded');
}

main()
	.catch((e) => console.error(e))
	.finally(() => prisma.$disconnect());
