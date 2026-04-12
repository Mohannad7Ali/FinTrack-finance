import { z } from 'zod';
export const transactionSchema = z.object({
	type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
	amount: z.number().positive(),
	occurredAt: z.string().datetime(),
	description: z.string().optional(),
	categoryId: z.number().nullable().optional(),
	walletId: z.number(),
});

export const categorySchema = z.object({
	name: z.string().min(2),
	icon: z.string().optional(),
});
