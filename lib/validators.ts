import { z } from 'zod';

export const transactionSchema = z.object({
	type: z.enum(['INCOME', 'EXPENSE']),
	amount: z
		.string()
		.min(1, 'يرجى إدخال المبلغ')
		.refine((val) => {
			const parsed = parseFloat(val.replace(/\s/g, '').replace(/,/g, '.'));
			return !isNaN(parsed) && parsed > 0;
		}, 'المبلغ يجب أن يكون رقماً أكبر من صفر'),
	date: z.string().min(1, 'يرجى تحديد التاريخ'),
	description: z.string().optional(),
	categoryId: z.number(),
	walletId: z.number(),
});

export const categorySchema = z.object({
	name: z.string().min(2),
	icon: z.string().optional(),
});
