import { z } from 'zod';

// ========== Schema الخاص بـ API (يستقبل بيانات جاهزة للـ Prisma) ==========
export const transactionApiSchema = z.object({
	type: z.enum(['INCOME', 'EXPENSE']),
	amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
	occurredAt: z.string().datetime(), // بصيغة ISO
	description: z.string().optional(),
	categoryId: z.number().nullable(),
	walletId: z.number().positive(),
});
export type TransactionApiValues = z.infer<typeof transactionApiSchema>;

// ========== Schema الخاص بـ Form (للإدخال من المستخدم) ==========
export const transactionFormSchema = z.object({
	type: z.enum(['INCOME', 'EXPENSE']),
	amount: z
		.string()
		.min(1, 'يرجى إدخال المبلغ')
		.regex(/^\d+(\.\d{1,2})?$/, 'أدخل مبلغاً صحيحاً (مثال: 100.50)'),
	occurredAt: z.date('يرجى اختيار التاريخ'),
	description: z.string().optional(),
	categoryId: z.string().optional(),
	walletId: z.string().min(1, 'اختر محفظة'),
});
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

// ========== دالة تحويل من Form إلى API ==========
export function transformFormToApi(values: TransactionFormValues): TransactionApiValues {
	return {
		type: values.type,
		amount: parseFloat(values.amount),
		occurredAt: values.occurredAt.toISOString(),
		description: values.description || undefined,
		categoryId: values.categoryId ? parseInt(values.categoryId) : null,
		walletId: parseInt(values.walletId),
	};
}

// ==========   categorySchema   ==========
export const categorySchema = z.object({
	name: z.string().min(2),
	icon: z.string().optional(),
});
