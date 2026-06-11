import { PrismaClient, TxType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

const poolConfig = {
	connectionString: process.env.DATABASE_POOLED_URL,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000,
};

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ========== بيانات المستخدم ==========
const MOHANNAD = {
	name: 'مهند علي',
	email: 'mohannad@fintrack.com',
	password: 'mohannad123',
	preferredCurrency: 'USD',
	salary: 4250,
	rent: 950,
};

// المحافظ
const WALLETS = [
	{ name: 'الحساب البنكي الرئيسي', balance: 5840, currency: 'USD' },
	{ name: 'المحفظة النقدية', balance: 320, currency: 'USD' },
	{ name: 'بطاقة Visa', balance: -215, currency: 'USD' },
	{ name: 'حساب توفير', balance: 3200, currency: 'USD' },
	{ name: 'PayPal', balance: 450, currency: 'USD' },
];

// التصنيفات (بدون حقل type)
const CATEGORIES = [
	{ name: 'الراتب', icon: '💼' },
	{ name: 'عمل حر', icon: '💻' },
	{ name: 'إيجار', icon: '🏠' },
	{ name: 'فواتير كهرباء وماء', icon: '💡' },
	{ name: 'إنترنت', icon: '🌐' },
	{ name: 'قهوة', icon: '☕' },
	{ name: 'مطاعم', icon: '🍽️' },
	{ name: 'سوبرماركت', icon: '🛒' },
	{ name: 'وجبات سريعة', icon: '🍔' },
	{ name: 'بنزين', icon: '⛽' },
	{ name: 'تاكسي', icon: '🚕' },
	{ name: 'مواصلات عامة', icon: '🚌' },
	{ name: 'نتفليكس', icon: '📺' },
	{ name: 'سبوتيفاي', icon: '🎵' },
	{ name: 'إلكترونيات', icon: '💻' },
	{ name: 'ملابس', icon: '👕' },
	{ name: 'صيدلية', icon: '💊' },
	{ name: 'جيم', icon: '💪' },
];

// دوال مساعدة
function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
	console.log('🚀 بدء seeding بيانات مهند علي (آخر 4 أشهر من 2026)...');

	// 1. إنشاء المستخدم
	const hashedPassword = await bcrypt.hash(MOHANNAD.password, 10);
	let user = await prisma.user.findUnique({ where: { email: MOHANNAD.email } });
	if (!user) {
		user = await prisma.user.create({
			data: {
				name: MOHANNAD.name,
				email: MOHANNAD.email,
				passwordHash: hashedPassword,
				preferredCurrency: MOHANNAD.preferredCurrency,
				provider: 'credentials',
			},
		});
		console.log('✅ تم إنشاء المستخدم مهند');
	} else {
		console.log('⏭️ المستخدم مهند موجود، سيتم حذف معاملاته القديمة وإعادة إنشائها');
		await prisma.transaction.deleteMany({ where: { userId: user.id } });
	}

	// 2. إنشاء المحافظ
	const wallets = [];
	for (const w of WALLETS) {
		let wallet = await prisma.wallet.findFirst({ where: { userId: user.id, name: w.name } });
		if (!wallet) {
			wallet = await prisma.wallet.create({
				data: { ...w, userId: user.id },
			});
			console.log(`  ✅ محفظة: ${w.name} (${w.currency}) - رصيد ${w.balance}`);
		} else {
			console.log(`  ⏭️ محفظة موجودة: ${w.name}`);
		}
		wallets.push(wallet);
	}

	// 3. إنشاء التصنيفات
	const userCategoriesMap = new Map();
	for (const cat of CATEGORIES) {
		// تصنيف عمومي (اختياري)
		const existingDefault = await prisma.category.findFirst({
			where: { userId: null, name: cat.name },
		});
		if (!existingDefault) {
			await prisma.category.create({
				data: { name: cat.name, icon: cat.icon, isDefault: true, userId: null },
			});
		}
		// تصنيف المستخدم
		const userCat = await prisma.category.upsert({
			where: { userId_name: { userId: user.id, name: cat.name } },
			update: {},
			create: { name: cat.name, icon: cat.icon, userId: user.id, isDefault: false },
		});
		userCategoriesMap.set(cat.name, userCat);
	}
	console.log(`✅ تم إعداد ${CATEGORIES.length} تصنيف للمستخدم`);

	// 4. توليد المعاملات لآخر 4 أشهر (مارس – يونيو 2026)
	const transactions: Array<{
		type: TxType;
		amount: number;
		occurredAt: Date;
		description: string;
		userId: number;
		categoryId: number | null;
		walletId: number;
	}> = [];

	const months = [
		{ year: 2026, month: 2, name: 'مارس' }, // 2 = March
		{ year: 2026, month: 3, name: 'أبريل' }, // 3 = April
		{ year: 2026, month: 4, name: 'مايو' }, // 4 = May
		{ year: 2026, month: 5, name: 'يونيو' }, // 5 = June
	];

	const mainWallet = wallets.find((w) => w.name === 'الحساب البنكي الرئيسي')!;
	const cashWallet = wallets.find((w) => w.name === 'المحفظة النقدية')!;
	const visaWallet = wallets.find((w) => w.name === 'بطاقة Visa')!;
	const savingsWallet = wallets.find((w) => w.name === 'حساب توفير')!;

	for (const { year, month, name } of months) {
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysInMonth = lastDay.getDate();

		// 1. الراتب في أول يوم
		const salaryAmount = MOHANNAD.salary + randomInt(-80, 80);
		transactions.push({
			type: TxType.INCOME,
			amount: salaryAmount,
			occurredAt: firstDay,
			description: `راتب شهر ${name} ${year}`,
			userId: user.id,
			categoryId: userCategoriesMap.get('الراتب').id,
			walletId: mainWallet.id,
		});

		// 2. الإيجار في يوم 1 أو 2
		transactions.push({
			type: TxType.EXPENSE,
			amount: MOHANNAD.rent,
			occurredAt: new Date(year, month, randomInt(1, 2)),
			description: `إيجار الشقة - شهر ${name}`,
			userId: user.id,
			categoryId: userCategoriesMap.get('إيجار').id,
			walletId: mainWallet.id,
		});

		// 3. فواتير الكهرباء والماء (منتصف الشهر)
		transactions.push({
			type: TxType.EXPENSE,
			amount: randomInt(65, 95),
			occurredAt: new Date(year, month, randomInt(12, 18)),
			description: 'فاتورة كهرباء ومياه',
			userId: user.id,
			categoryId: userCategoriesMap.get('فواتير كهرباء وماء').id,
			walletId: mainWallet.id,
		});

		// 4. فاتورة الإنترنت
		transactions.push({
			type: TxType.EXPENSE,
			amount: randomInt(40, 55),
			occurredAt: new Date(year, month, randomInt(10, 20)),
			description: 'اشتراك إنترنت منزلي',
			userId: user.id,
			categoryId: userCategoriesMap.get('إنترنت').id,
			walletId: mainWallet.id,
		});

		// 5. اشتراكات شهرية
		transactions.push({
			type: TxType.EXPENSE,
			amount: 12,
			occurredAt: new Date(year, month, randomInt(5, 10)),
			description: 'نتفليكس',
			userId: user.id,
			categoryId: userCategoriesMap.get('نتفليكس').id,
			walletId: mainWallet.id,
		});
		transactions.push({
			type: TxType.EXPENSE,
			amount: 7,
			occurredAt: new Date(year, month, randomInt(15, 20)),
			description: 'سبوتيفاي',
			userId: user.id,
			categoryId: userCategoriesMap.get('سبوتيفاي').id,
			walletId: mainWallet.id,
		});

		// 6. مصروفات يومية (15–25 معاملة لكل شهر)
		const dailyCategories = ['قهوة', 'مطاعم', 'سوبرماركت', 'وجبات سريعة', 'تاكسي', 'مواصلات عامة'];
		const dailyCount = randomInt(18, 25);
		for (let i = 0; i < dailyCount; i++) {
			const day = randomInt(1, daysInMonth);
			const catName = dailyCategories[Math.floor(Math.random() * dailyCategories.length)];
			let amount = 0;
			switch (catName) {
				case 'قهوة':
					amount = randomInt(2, 6);
					break;
				case 'مطاعم':
					amount = randomInt(10, 25);
					break;
				case 'سوبرماركت':
					amount = randomInt(15, 55);
					break;
				case 'وجبات سريعة':
					amount = randomInt(5, 15);
					break;
				case 'تاكسي':
					amount = randomInt(3, 12);
					break;
				case 'مواصلات عامة':
					amount = randomInt(1, 4);
					break;
			}
			transactions.push({
				type: TxType.EXPENSE,
				amount,
				occurredAt: new Date(year, month, day),
				description: `${catName} - يومي`,
				userId: user.id,
				categoryId: userCategoriesMap.get(catName).id,
				walletId: cashWallet.id,
			});
		}

		// 7. دخل إضافي (عمل حر) – مرة كل شهرين تقريباً
		if (month === 2 || month === 4) {
			const freelanceAmount = randomInt(250, 650);
			transactions.push({
				type: TxType.INCOME,
				amount: freelanceAmount,
				occurredAt: new Date(year, month, randomInt(20, 28)),
				description: 'عمل حر - تصميم/تطوير',
				userId: user.id,
				categoryId: userCategoriesMap.get('عمل حر').id,
				walletId: mainWallet.id,
			});
		}

		// 8. تحويلات بين المحافظ (مرة في الشهر)
		const transferAmount = randomInt(100, 300);
		transactions.push({
			type: TxType.TRANSFER,
			amount: transferAmount,
			occurredAt: new Date(year, month, randomInt(5, 25)),
			description: 'تحويل من بنكي إلى نقدي',
			userId: user.id,
			categoryId: null,
			walletId: mainWallet.id,
		});

		// 9. ادخار (تحويل إلى حساب التوفير)
		const savingAmount = randomInt(150, 400);
		transactions.push({
			type: TxType.TRANSFER,
			amount: savingAmount,
			occurredAt: new Date(year, month, randomInt(25, 28)),
			description: 'تحويل إلى حساب التوفير',
			userId: user.id,
			categoryId: null,
			walletId: mainWallet.id,
		});

		// 10. مشتريات كبيرة (مرة كل شهرين)
		if (month === 2 || month === 4) {
			const bigAmount = randomInt(300, 1200);
			const catName = Math.random() > 0.5 ? 'إلكترونيات' : 'ملابس';
			transactions.push({
				type: TxType.EXPENSE,
				amount: bigAmount,
				occurredAt: new Date(year, month, randomInt(10, 25)),
				description: `شراء ${catName === 'إلكترونيات' ? 'جهاز إلكتروني' : 'ملابس'}`,
				userId: user.id,
				categoryId: userCategoriesMap.get(catName).id,
				walletId: visaWallet.id,
			});
		}
	}

	// إضافة معاملات إضافية عشوائية لسد العدد (لتصل إلى حوالي 150–200)
	const extraNeeded = randomInt(20, 40);
	for (let i = 0; i < extraNeeded; i++) {
		const randomMonth = months[Math.floor(Math.random() * months.length)];
		const day = randomInt(1, new Date(randomMonth.year, randomMonth.month + 1, 0).getDate());
		const isIncome = Math.random() < 0.2;
		const amount = isIncome ? randomInt(20, 300) : randomInt(5, 100);
		const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
		const category = userCategoriesMap.get(randomCat.name);
		transactions.push({
			type: isIncome ? TxType.INCOME : TxType.EXPENSE,
			amount,
			occurredAt: new Date(randomMonth.year, randomMonth.month, day),
			description: isIncome ? 'دخل متنوع' : 'مصروف متنوع',
			userId: user.id,
			categoryId: category.id,
			walletId: wallets[Math.floor(Math.random() * wallets.length)].id,
		});
	}

	// حفظ المعاملات
	await prisma.transaction.createMany({
		data: transactions,
		skipDuplicates: true,
	});

	console.log(`✅ تم إنشاء ${transactions.length} معاملة حقيقية لمهند (آخر 4 أشهر من 2026)`);
	console.log('\n🎉 اكتمل الـ Seeding بنجاح!');
	console.log(`\n🔑 بيانات تسجيل الدخول:`);
	console.log(`   Email    : ${MOHANNAD.email}`);
	console.log(`   Password : ${MOHANNAD.password}`);
	console.log(`   الفترة الزمنية: مارس – يونيو 2026`);
}

main()
	.catch((e) => {
		console.error('❌ فشل الـ Seeding:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
