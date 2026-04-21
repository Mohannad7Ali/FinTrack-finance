// app/(dashboard)/transactions/TransactionFormDialog.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DatePicker from 'react-multi-date-picker';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { transactionFormSchema } from '@/lib/validators';
import type { Transaction, Category, Wallet } from '@/types/transactions';

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingTx: Transaction | null;
	categories: Category[];
	wallets: Wallet[];
	isSubmitting: boolean;
	onSubmit: (values: TransactionFormValues) => Promise<void>;
}

export function TransactionFormDialog({
	open,
	onOpenChange,
	editingTx,
	categories,
	wallets,
	isSubmitting,
	onSubmit,
}: TransactionFormDialogProps) {
	const form = useForm<TransactionFormValues>({
		resolver: zodResolver(transactionFormSchema),
		defaultValues: {
			type: 'EXPENSE',
			amount: '',
			description: '',
			categoryId: '',
			walletId: '',
		},
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = form;
	const transactionType = watch('type');

	// تجنب إعادة التعيين المتكررة باستخدام useRef
	const lastResetKey = useRef<string | null>(null);

	useEffect(() => {
		if (!open) return;

		// مفتاح فريد يعتمد على حالة التعديل
		const resetKey = editingTx ? `edit-${editingTx.id}` : 'new';

		// إذا كان نفس المفتاح السابق، لا نعيد التعيين
		if (lastResetKey.current === resetKey) return;

		lastResetKey.current = resetKey;

		if (editingTx) {
			reset({
				type: editingTx.type,
				amount: editingTx.amount.toString(),
				occurredAt: new Date(editingTx.occurredAt),
				description: editingTx.description || '',
				categoryId: editingTx.category?.id.toString() || '',
				walletId: editingTx.wallet.id.toString(),
			});
		} else {
			reset({
				type: 'EXPENSE',
				amount: '',
				occurredAt: new Date(),
				description: '',
				categoryId: '',
				walletId: '',
			});
		}
	}, [open, editingTx, reset]);

	const handleFormSubmit = handleSubmit(async (values) => {
		await onSubmit(values);
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl rounded-xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
				<DialogHeader className="space-y-2 pb-2">
					<DialogTitle className="text-xl sm:text-2xl font-bold">
						{editingTx ? 'تعديل المعاملة' : 'إضافة معاملة جديدة'}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-400">
						أدخل بيانات المعاملة. سيتم تحديث رصيد المحفظة تلقائياً.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="space-y-5 py-2">
					{/* Type Toggle with icons */}
					<div className="flex flex-row gap-3 justify-end">
						<Button
							type="button"
							variant={transactionType === 'INCOME' ? 'default' : 'outline'}
							onClick={() => setValue('type', 'INCOME')}
							className={`flex-1 sm:flex-none gap-2 transition-all ${
								transactionType === 'INCOME'
									? 'bg-emerald-600 hover:bg-emerald-500 text-white'
									: 'border-slate-600 text-slate-300 hover:bg-slate-800'
							}`}
						>
							<TrendingUp className="h-4 w-4" />
							<span>دخل</span>
						</Button>
						<Button
							type="button"
							variant={transactionType === 'EXPENSE' ? 'default' : 'outline'}
							onClick={() => setValue('type', 'EXPENSE')}
							className={`flex-1 sm:flex-none gap-2 transition-all ${
								transactionType === 'EXPENSE'
									? 'bg-red-600 hover:bg-red-500 text-white'
									: 'border-slate-600 text-slate-300 hover:bg-slate-800'
							}`}
						>
							<TrendingDown className="h-4 w-4" />
							<span>مصروف</span>
						</Button>
					</div>

					{/* Amount */}
					<div className="space-y-2">
						<Label className="text-slate-300 text-sm font-medium block text-right">المبلغ</Label>
						<Input
							{...register('amount')}
							type="number"
							step="0.01"
							placeholder="0.00"
							dir="ltr"
							className={`bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-right ${
								errors.amount ? 'border-red-500 focus:ring-red-500' : ''
							}`}
						/>
						{errors.amount && (
							<p className="text-red-400 text-xs mt-1 text-right">{errors.amount.message}</p>
						)}
					</div>

					{/* Date */}
					<div className="space-y-2">
						<Label className="text-slate-300 text-sm font-medium block text-right">التاريخ</Label>
						<DatePicker
							value={watch('occurredAt')}
							onChange={(date) => setValue('occurredAt', date?.toDate() || new Date())}
							calendar={'gregorian' as any}
							format="YYYY/MM/DD"
							containerClassName="w-full"
							className="w-full"
							render={(value, openCalendar) => (
								<Button
									variant="outline"
									onClick={openCalendar}
									type="button"
									className="w-full justify-between text-right font-normal bg-slate-900/50 border-slate-700 text-white hover:bg-slate-800"
								>
									<span className="flex items-center gap-2">
										<CalendarIcon className="h-4 w-4 text-slate-400" />
										{value ? format(value, 'PPP', { locale: ar }) : 'اختر التاريخ'}
									</span>
								</Button>
							)}
						/>
						{errors.occurredAt && (
							<p className="text-red-400 text-xs mt-1 text-right">{errors.occurredAt.message}</p>
						)}
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label className="text-slate-300 text-sm font-medium block text-right">
							الوصف <span className="text-slate-500">(اختياري)</span>
						</Label>
						<Input
							{...register('description')}
							placeholder="مثال: قهوة الصباح"
							className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 text-right"
						/>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label className="text-slate-300 text-sm font-medium block text-right">الفئة</Label>
						<Select
							onValueChange={(val) => setValue('categoryId', val)}
							value={watch('categoryId')}
						>
							<SelectTrigger className="bg-slate-900/50 border-slate-700 text-white text-right">
								<SelectValue placeholder="اختر فئة" />
							</SelectTrigger>
							<SelectContent className="bg-slate-900 border-slate-700 text-white">
								{categories.map((cat) => (
									<SelectItem key={cat.id} value={cat.id.toString()} className="text-right">
										{cat.icon && <span className="ml-2">{cat.icon}</span>}
										{cat.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Wallet */}
					<div className="space-y-2">
						<Label className="text-slate-300 text-sm font-medium block text-right">المحفظة</Label>
						<Select onValueChange={(val) => setValue('walletId', val)} value={watch('walletId')}>
							<SelectTrigger className="bg-slate-900/50 border-slate-700 text-white text-right">
								<SelectValue placeholder="اختر محفظة" />
							</SelectTrigger>
							<SelectContent className="bg-slate-900 border-slate-700 text-white">
								{wallets.map((wallet) => (
									<SelectItem key={wallet.id} value={wallet.id.toString()} className="text-right">
										{wallet.name} ({wallet.currency})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.walletId && (
							<p className="text-red-400 text-xs mt-1 text-right">{errors.walletId.message}</p>
						)}
					</div>

					<DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800"
						>
							إلغاء
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
						>
							{isSubmitting ? 'جاري الحفظ...' : editingTx ? 'تحديث' : 'إضافة'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
