import { z } from 'zod';

const messages = {
	name: {
		required: 'الاسم مطلوب',
		min: 'الاسم قصير جداً، يجب أن يكون 2 أحرف على الأقل',
	},
	email: {
		invalid: 'البريد الإلكتروني غير صالح',
	},
	password: {
		min: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
	},
};

//  Register Schema
export const registerSchema = z.object({
	name: z.string().min(1, messages.name.required).min(2, messages.name.min),

	email: z.string().email(messages.email.invalid).toLowerCase().trim(),

	password: z.string().min(6, messages.password.min),
});

//  Login Schema
export const loginSchema = z.object({
	email: z.string().email(messages.email.invalid).toLowerCase().trim(),

	password: z.string().min(6, messages.password.min),
});

//  Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
