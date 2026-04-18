'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
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

// ========== Types ==========
type Category = {
	id: number;
	name: string;
	icon: string | null;
	userId: number | null;
	isDefault: boolean;
	createdAt: string;
	updatedAt: string;
};

// ========== Fetcher ==========
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ========== Main Component ==========
export default function CategoriesPage() {
	// Prevent hydration mismatch
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	// SWR data fetching
	const { data, error, isLoading, mutate } = useSWR<{ ok: boolean; categories: Category[] }>(
		'/api/categories',
		fetcher
	);

	// UI state
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// Form fields
	const [newName, setNewName] = useState('');
	const [newIcon, setNewIcon] = useState('');
	const [editName, setEditName] = useState('');
	const [editIcon, setEditIcon] = useState('');

	// Derived data
	const allCategories = data?.ok ? data.categories : [];
	const defaultCategories = allCategories.filter((cat) => cat.userId === null);
	const userCategories = allCategories.filter((cat) => cat.userId !== null);

	// ========== Handlers ==========
	const handleAddCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newName.trim(), icon: newIcon?.trim() || null }),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل إضافة الفئة');
			await mutate();
			setNewName('');
			setNewIcon('');
			setShowAddForm(false);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditCategory = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingCategory || isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/categories/${editingCategory.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: editName.trim(), icon: editIcon?.trim() || null }),
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل تعديل الفئة');
			await mutate();
			setEditingCategory(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const confirmDelete = async () => {
		if (!categoryToDelete || isSubmitting) return;
		setIsSubmitting(true);
		setErrorMsg(null);
		try {
			const res = await fetch(`/api/categories/${categoryToDelete.id}`, {
				method: 'DELETE',
			});
			const json = await res.json();
			if (!res.ok || !json.ok) throw new Error(json.error || 'فشل حذف الفئة');
			await mutate();
			setCategoryToDelete(null);
		} catch (err: any) {
			setErrorMsg(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openEditForm = (cat: Category) => {
		setErrorMsg(null);
		setEditingCategory(cat);
		setEditName(cat.name);
		setEditIcon(cat.icon || '');
	};

	// ========== Loading / Error ==========
	if (!mounted) return <LoadingScreen />;
	if (isLoading) return <LoadingScreen />;
	if (error) return <ErrorScreen message={error.message} />;

	// ========== Render ==========
	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 space-y-8"
			dir="rtl"
		>
			{/* Description Card */}
			<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-lg">
				<h1 className="text-xl font-bold text-white mb-2">إدارة الفئات</h1>
				<p className="text-slate-300 text-sm leading-relaxed">
					يمكنك هنا إضافة فئاتك الخاصة (مثل قهوة، مواصلات، تسوق) لتخصيص تصنيف معاملاتك المالية.
					الفئات العامة (الافتراضية) لا يمكن تعديلها أو حذفها، لكن يمكنك استخدامها كما هي.
					<br />
					<span className="text-emerald-400">✦ إضافة فئة جديدة:</span> أدخل اسماً وأيقونة (اختياري)
					– ستظهر فوراً في قائمة الفئات عند تسجيل المعاملات.
					<br />
					<span className="text-amber-400">✦ تعديل فئة خاصة بك:</span> يمكنك تغيير الاسم أو الأيقونة
					في أي وقت عبر نافذة منبثقة.
					<br />
					<span className="text-rose-400">✦ حذف فئة خاصة:</span> سيتم إلغاء ربط أي معاملات بها (لن
					تُحذف المعاملات، لكن ستصبح بدون فئة). سيظهر لك صندوق تأكيد قبل الحذف لمنع الأخطاء.
				</p>
			</div>

			{/* Global Error */}
			{errorMsg && (
				<div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm">
					{errorMsg}
				</div>
			)}

			{/* Add Button */}
			<div className="flex justify-end">
				<Button
					onClick={() => setShowAddForm(!showAddForm)}
					className="bg-emerald-600 hover:bg-emerald-500"
				>
					{showAddForm ? 'إلغاء' : '+ إضافة فئة جديدة'}
				</Button>
			</div>

			{/* Add Form (Inline) */}
			{showAddForm && (
				<div className="rounded-2xl border border-white/10 bg-white/5 p-5">
					<h3 className="text-white font-semibold mb-3">إضافة فئة خاصة</h3>
					<form onSubmit={handleAddCategory} className="space-y-4">
						<div>
							<label className="block text-slate-300 text-sm mb-1">الاسم *</label>
							<input
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-2 text-white"
								required
							/>
						</div>
						<div>
							<label className="block text-slate-300 text-sm mb-1">الأيقونة (رمز أو نص)</label>
							<input
								type="text"
								value={newIcon}
								onChange={(e) => setNewIcon(e.target.value)}
								className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-2 text-white"
								placeholder="مثال: ☕، 🚗، 🛒"
							/>
						</div>
						<Button type="submit" disabled={isSubmitting} className="bg-emerald-600">
							{isSubmitting ? 'جاري الإضافة...' : 'إضافة'}
						</Button>
					</form>
				</div>
			)}

			{/* Default Categories Section */}
			<Section title="الفئات العامة (الافتراضية)" description="لا يمكن تعديلها أو حذفها">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{defaultCategories.map((cat) => (
						<CategoryCard key={cat.id} category={cat} isDefault />
					))}
				</div>
			</Section>

			{/* User Categories Section */}
			<Section title="فئاتي الخاصة" description="يمكنك تعديل أو حذف أي منها">
				{userCategories.length === 0 ? (
					<div className="text-center py-8 text-slate-400 text-sm border border-dashed border-white/20 rounded-xl">
						لا توجد فئات خاصة بعد. أضف فئتك الأولى باستخدام الزر أعلاه.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{userCategories.map((cat) => (
							<CategoryCard
								key={cat.id}
								category={cat}
								onEdit={() => openEditForm(cat)}
								onDelete={() => setCategoryToDelete(cat)}
							/>
						))}
					</div>
				)}
			</Section>

			{/* Edit Dialog (shadcn/ui Dialog) */}
			<Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>تعديل الفئة</DialogTitle>
						<DialogDescription>قم بتعديل اسم الفئة أو الرمز الخاص بها.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleEditCategory} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="edit-name" className="block text-sm font-medium text-slate-200">
								الاسم
							</label>
							<input
								id="edit-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-white"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="edit-icon" className="block text-sm font-medium text-slate-200">
								الأيقونة
							</label>
							<input
								id="edit-icon"
								value={editIcon}
								onChange={(e) => setEditIcon(e.target.value)}
								className="w-full bg-slate-800 border border-white/10 rounded-md p-2 text-white"
							/>
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setEditingCategory(null)}>
								إلغاء
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog (shadcn/ui AlertDialog) */}
			<AlertDialog
				open={!!categoryToDelete}
				onOpenChange={(open) => !open && setCategoryToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
						<AlertDialogDescription>
							هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الفئة {categoryToDelete?.name} بشكل دائم،
							وسيتم إلغاء ربط أي معاملات مرتبطة بها.
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

// ========== Helper Components ==========
function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<div>
				<h2 className="text-lg font-semibold text-white">{title}</h2>
				<p className="text-xs text-slate-400">{description}</p>
			</div>
			{children}
		</div>
	);
}

function CategoryCard({
	category,
	isDefault = false,
	onEdit,
	onDelete,
}: {
	category: Category;
	isDefault?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
}) {
	return (
		<div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
			<div className="flex items-center gap-3">
				{category.icon && <span className="text-xl">{category.icon}</span>}
				<span className="text-white font-medium">{category.name}</span>
				{isDefault && (
					<span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
						عامة
					</span>
				)}
			</div>
			{!isDefault && onEdit && onDelete && (
				<div className="flex gap-2">
					<button
						onClick={onEdit}
						className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition"
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
						className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
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
			)}
		</div>
	);
}

function LoadingScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-3">
			<div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
			<p className="text-slate-300 text-sm animate-pulse">جاري تحميل الفئات...</p>
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
			<p>فشل تحميل الفئات: {message}</p>
		</div>
	);
}
