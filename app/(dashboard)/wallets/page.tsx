'use client';

import { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { CurrencyCode } from '@/types/finance';

// ========== Types ==========
type Wallet = {
	id: number;
	name: string;
	balance: number;
	currency: string;
	createdAt: string;
};

// ========== Fetcher ==========
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// قائمة العملات المدعومة من API
const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'SYP', 'GBP', 'TRY', 'AED', 'SAR'];

export default function WalletsPage() {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const { data, error, isLoading, mutate } = useSWR<{ ok: boolean; wallets: Wallet[] }>(
		'/api/wallets',
		fetcher
	);

	// حالة النماذج
	const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
	const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
	const [showAddForm, setShowAddForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// حقول النموذج
	const [newName, setNewName] = useState('');
	const [newCurrency, setNewCurrency] = useState<CurrencyCode>('SYP');
	const [editName, setEditName] = useState('');
	const [editCurrency, setEditCurrency] = useState<CurrencyCode>('SYP');

	// استخدام أسعار الصرف
	const { convert, rates, isLoading: ratesLoading } = useExchangeRates();

	// الحصول على العملة المفضلة للمستخدم (من user context أو localStorage، هنا نفترض أنها 'SYP' افتراضياً)
	// يمكن لاحقاً جلبها من API /api/user/preferences
	const preferredCurrency: CurrencyCode = 'SYP'; // ستغير حسب إعدادات المستخدم

	const wallets = data?.ok ? data.wallets : [];

	// حساب إجمالي الرصيد بالعملة المفضلة
	const totalBalanceInPreferred = wallets.reduce((total, wallet) => {
		if (!rates) return total;
		const converted = convert(wallet.balance, wallet.currency as CurrencyCode, preferredCurrency);
		return total + (isNaN(converted) ? 0 : converted);
	}, 0);

	// ========== Handlers ==========
	const handleAddWallet = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch('/api/wallets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newName.trim(), currency: newCurrency }),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل إضافة المحفظة');
			await mutate();
			setNewName('');
			setNewCurrency('SYP');
			setShowAddForm(false);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditWallet = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingWallet || isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/wallets/${editingWallet.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editName.trim(), currency: editCurrency }),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل تعديل المحفظة');
			await mutate();
			setEditingWallet(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const confirmDelete = async () => {
		if (!walletToDelete || isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/wallets/${walletToDelete.id}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل حذف المحفظة');
			await mutate();
			setWalletToDelete(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openEditForm = (wallet: Wallet) => {
		setErrorMsg(null);
		setEditingWallet(wallet);
		setEditName(wallet.name);
		setEditCurrency(wallet.currency as CurrencyCode);
	};

	if (!mounted) return <LoadingScreen />;
	if (isLoading) return <LoadingScreen />;
	if (error) return <ErrorScreen message={error.message} />;

	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 space-y-6"
			dir="rtl"
		>
			{/* وصف الصفحة */}
			<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
				<h1 className="text-xl font-bold text-white mb-2">إدارة المحافظ المالية</h1>
				<p className="text-slate-300 text-sm leading-relaxed">
					المحافظ هي حاويات لأموالك (مثل: محفظة نقدية، حساب بنكي، محفظة دولارية). يمكنك إضافة عدة
					محافظ بعملات مختلفة، وسيتم تحويل رصيد كل محفظة تلقائياً إلى العملة المفضلة (حالياً{' '}
					<strong className="text-emerald-400">{preferredCurrency}</strong>) لعرض إجمالي مدخراتك
					بشكل موحد.
					<br />
					<span className="text-emerald-400">✦ إضافة محفظة جديدة:</span> أدخل اسماً واختر العملة.
					<br />
					<span className="text-amber-400">✦ تعديل محفظة:</span> يمكنك تغيير الاسم أو العملة لاحقاً.
					<br />
					<span className="text-rose-400">✦ حذف محفظة:</span> لا يمكن حذف محفظة تحتوي على معاملات
					مالية. قم بنقل أو حذف المعاملات أولاً.
				</p>
			</div>

			{/* إجمالي الرصيد */}
			<div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 rounded-2xl border border-emerald-500/30 p-5">
				<div className="text-center">
					<p className="text-slate-300 text-sm">إجمالي الرصيد (بـ {preferredCurrency})</p>
					<p className="text-3xl md:text-4xl font-bold text-emerald-400">
						{ratesLoading ? 'جاري التحميل...' : totalBalanceInPreferred.toLocaleString()}
					</p>
					<p className="text-xs text-slate-400 mt-1">محسوب بأسعار الصرف الحالية</p>
				</div>
			</div>

			{/* رسالة خطأ عامة */}
			{errorMsg && (
				<div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
					{errorMsg}
				</div>
			)}

			{/* زر الإضافة */}
			<div className="flex justify-end">
				<Button
					onClick={() => setShowAddForm(!showAddForm)}
					className="bg-emerald-600 hover:bg-emerald-500"
				>
					{showAddForm ? 'إلغاء' : '+ إضافة محفظة جديدة'}
				</Button>
			</div>

			{/* نموذج الإضافة (مضمن) */}
			{showAddForm && (
				<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
					<h3 className="text-white font-semibold mb-3">إضافة محفظة جديدة</h3>
					<form onSubmit={handleAddWallet} className="space-y-4">
						<div>
							<Label className="text-slate-300">اسم المحفظة</Label>
							<Input
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="مثال: المحفظة النقدية"
								required
								className="bg-slate-800/50 border-white/10 text-white"
							/>
						</div>
						<div>
							<Label className="text-slate-300">العملة الأساسية</Label>
							<Select
								value={newCurrency}
								onValueChange={(val) => setNewCurrency(val as CurrencyCode)}
							>
								<SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SUPPORTED_CURRENCIES.map((cur) => (
										<SelectItem key={cur} value={cur}>
											{cur}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<Button type="submit" disabled={isSubmitting} className="bg-emerald-600">
							{isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
						</Button>
					</form>
				</div>
			)}

			{/* قائمة المحافظ */}
			{wallets.length === 0 ? (
				<div className="text-center py-12 text-slate-400 border border-dashed border-white/20 rounded-xl">
					لا توجد محافظ بعد. أضف محفظتك الأولى باستخدام الزر أعلاه.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{wallets.map((wallet) => (
						<WalletCard
							key={wallet.id}
							wallet={wallet}
							preferredCurrency={preferredCurrency}
							convert={convert}
							ratesLoading={ratesLoading}
							onEdit={() => openEditForm(wallet)}
							onDelete={() => setWalletToDelete(wallet)}
						/>
					))}
				</div>
			)}

			{/* حوار التعديل */}
			<Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>تعديل المحفظة</DialogTitle>
						<DialogDescription>قم بتعديل اسم المحفظة أو العملة.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditWallet} className="space-y-4">
						<div>
							<Label>اسم المحفظة</Label>
							<Input
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								required
								className="bg-slate-800 border-white/10"
							/>
						</div>
						<div>
							<Label>العملة</Label>
							<Select
								value={editCurrency}
								onValueChange={(val) => setEditCurrency(val as CurrencyCode)}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{SUPPORTED_CURRENCIES.map((cur) => (
										<SelectItem key={cur} value={cur}>
											{cur}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setEditingWallet(null)}>
								إلغاء
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* حوار تأكيد الحذف */}
			<AlertDialog
				open={!!walletToDelete}
				onOpenChange={(open) => !open && setWalletToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>هل أنت متأكد من حذف المحفظة؟</AlertDialogTitle>
						<AlertDialogDescription>
							هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المحفظة {walletToDelete?.name} نهائياً.
							{walletToDelete && (
								<span className="block mt-2 text-amber-400">
									ملاحظة: لا يمكن حذف المحفظة إذا كانت تحتوي على معاملات.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>إلغاء</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
							نعم، قم بالحذف
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</main>
	);
}

// ========== Components ==========
function WalletCard({
	wallet,
	preferredCurrency,
	convert,
	ratesLoading,
	onEdit,
	onDelete,
}: {
	wallet: Wallet;
	preferredCurrency: CurrencyCode;
	convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
	ratesLoading: boolean;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const convertedBalance = convert(
		wallet.balance,
		wallet.currency as CurrencyCode,
		preferredCurrency
	);
	const isConverted = wallet.currency !== preferredCurrency;

	return (
		<div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition flex flex-col gap-3">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-white font-semibold text-lg">{wallet.name}</h3>
					<p className="text-xs text-slate-400">العملة: {wallet.currency}</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={onEdit}
						className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
						title="تعديل"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</button>
					<button
						onClick={onDelete}
						className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
						title="حذف"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
				</div>
			</div>
			<div>
				<p className="text-slate-300 text-sm">الرصيد الأصلي:</p>
				<p className="text-white text-xl font-bold">
					{wallet.balance.toLocaleString()} {wallet.currency}
				</p>
				{isConverted && (
					<>
						<p className="text-slate-300 text-sm mt-2">بالعملة المفضلة ({preferredCurrency}):</p>
						<p className="text-emerald-400 text-lg font-semibold">
							{ratesLoading ? 'جاري التحويل...' : convertedBalance.toLocaleString()}
						</p>
					</>
				)}
			</div>
		</div>
	);
}

function LoadingScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-3">
			<div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
			<p className="text-slate-300 text-sm">جاري تحميل المحافظ...</p>
		</div>
	);
}

function ErrorScreen({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-2 text-red-400">
			<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p>فشل تحميل المحافظ: {message}</p>
		</div>
	);
}
