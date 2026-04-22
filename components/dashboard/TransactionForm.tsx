'use client';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
	transactionFormSchema,
	type TransactionFormValues,
	transformFormToApi,
} from '@/lib/validators';
import Link from 'next/link';
import { useState } from 'react';

type Category = { id: number; name: string };
type Wallet = { id: number; name: string };
type Props = { onCreated: () => void };

function TransactionForm({ onCreated }: Props) {
	const { data: catData, isLoading: catLoading } = useSWR<{
		ok: boolean;
		categories: Category[];
	}>('/api/categories', fetcher);
	const { data: walData, isLoading: walLoading } = useSWR<{ ok: boolean; wallets: Wallet[] }>(
		'/api/wallets',
		fetcher
	);
	const categories = catData?.categories || [];
	const wallets = walData?.wallets || [];

	const [submitError, setSubmitError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TransactionFormValues>({
		resolver: zodResolver(transactionFormSchema),
		defaultValues: {
			type: 'EXPENSE',
			amount: '',
			occurredAt: new Date(), // التاريخ الحالي كـ Date
			description: '',
			categoryId: '',
			walletId: '',
		},
	});

	const transactionType = watch('type');

	const onSubmit = async (data: TransactionFormValues) => {
		setSubmitError(null);
		try {
			const apiData = transformFormToApi(data);
			const response = await fetch('/api/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(apiData),
			});
			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || 'حدث خطأ في حفظ المعاملة');
			}
			reset(); // إعادة تعيين النموذج بعد النجاح
			onCreated(); // تحديث القائمة الرئيسية
		} catch (error: any) {
			setSubmitError(error.message);
		}
	};

	// أنماط التصميم (كما هي)
	const baseTypeBtn =
		'flex-1 px-3 py-2 rounded-xl text-sm font-bold border transition-all duration-200';
	const inactiveBtn = 'bg-slate-800/60 text-slate-300 border-white/10 hover:bg-slate-700/90';
	const inputStyles =
		'w-full border border-white/10 rounded-xl bg-slate-900/50 px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all';
	const activeExpense = 'bg-red-500 text-slate-950 border-red-400 shadow-sm shadow-red-500/20';
	const activeIncome =
		'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/20';

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" dir="rtl">
			<h2 className="text-base font-bold text-shadow-slate-100 mb-1">إضافة معاملة جديدة</h2>

			{/* أزرار نوع المعاملة */}
			<div className="flex gap-3">
				<button
					type="button"
					onClick={() => setValue('type', 'INCOME')}
					className={`${baseTypeBtn} ${transactionType === 'INCOME' ? activeIncome : inactiveBtn}`}
				>
					دخل
				</button>
				<button
					type="button"
					onClick={() => setValue('type', 'EXPENSE')}
					className={`${baseTypeBtn} ${
						transactionType === 'EXPENSE' ? activeExpense : inactiveBtn
					}`}
				>
					صرف
				</button>
			</div>

			{/* حقل المبلغ */}
			<div>
				<input
					{...register('amount')}
					type="text"
					inputMode="decimal"
					placeholder="المبلغ (مثال: 150.50)"
					className={`${inputStyles} ${
						errors.amount ? 'border-red-500/50 focus:ring-red-500/50' : ''
					}`}
				/>
				{errors.amount && (
					<span className="text-red-400 text-xs mt-1 block">{errors.amount.message}</span>
				)}
			</div>

			{/* حقل التاريخ - استخدمنا valueAsDate لتحويله إلى Date تلقائياً */}
			<div>
				<input
					{...register('occurredAt', { valueAsDate: true })}
					type="date"
					className={`${inputStyles} ${errors.occurredAt ? 'border-red-500/50' : ''}`}
				/>
				{errors.occurredAt && (
					<span className="text-red-400 text-xs mt-1 block">{errors.occurredAt.message}</span>
				)}
			</div>

			{/* حقل الوصف */}
			<div>
				<input {...register('description')} className={inputStyles} placeholder="الوصف (اختياري)" />
			</div>

			{/* قائمة الفئات */}
			{categories.length > 0 ? (
				<div>
					<select
						{...register('categoryId')}
						className={`${inputStyles} ${errors.categoryId ? 'border-red-500/50' : ''}`}
						defaultValue=""
					>
						<option value="" disabled>
							اختر الفئة
						</option>
						{categories.map((c) => (
							<option key={c.id} value={String(c.id)} className="bg-slate-800 text-white">
								{c.name}
							</option>
						))}
					</select>
					{errors.categoryId && (
						<span className="text-red-400 text-xs mt-1 block">{errors.categoryId.message}</span>
					)}
				</div>
			) : (
				<p className="text-xs text-amber-400/90 bg-amber-400/10 p-2 rounded-lg border border-amber-400/20">
					لا يوجد لديك فئات. يرجى إنشاء فئة من قسم
					<Link href="/categories" className="font-bold text-green-700 hover:opacity-80">
						{'   '}إدارة الفئات
					</Link>
				</p>
			)}

			{/* قائمة المحافظ */}
			<div>
				<select
					{...register('walletId')}
					className={`${inputStyles} ${errors.walletId ? 'border-red-500/50' : ''}`}
					defaultValue=""
				>
					<option value="" disabled>
						اختر المحفظة
					</option>
					{wallets.map((w) => (
						<option key={w.id} value={String(w.id)} className="bg-slate-800 text-white">
							{w.name}
						</option>
					))}
				</select>
				{errors.walletId && (
					<span className="text-red-400 text-xs mt-1 block">{errors.walletId.message}</span>
				)}
			</div>

			{/* عرض أخطاء الإرسال */}
			{submitError && (
				<div className="text-red-400 text-sm bg-red-400/10 p-2 rounded-lg">{submitError}</div>
			)}

			{/* زر الحفظ */}
			<button
				type="submit"
				disabled={isSubmitting || (categories.length === 0 && !catLoading)}
				className="mt-2 w-full rounded-xl px-4 py-3 text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
			>
				{isSubmitting ? 'جاري الحفظ...' : 'حفظ المعاملة'}
			</button>
		</form>
	);
}

export default TransactionForm;
