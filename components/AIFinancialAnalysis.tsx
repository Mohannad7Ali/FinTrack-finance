'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
	BrainCircuit,
	TrendingDown,
	PiggyBank,
	AlertTriangle,
	RefreshCw,
	ChevronDown,
	ChevronUp,
	Clock,
	Sparkles,
	BarChart3,
	ShieldCheck,
	Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisData {
	financial_health: string;
	spending_patterns: string[];
	saving_opportunities: string[];
	risk_alerts: string[];
	raw_summary: string;
	generated_at: string;
	isInsufficientData?: boolean;
}

const loadingTips = [
	'📊 قاعدة 50/30/20: 50% احتياجات، 30% رغبات، 20% ادخار',
	'🎯 حدد هدفاً شهرياً للتوفير – حتى لو صغيراً',
	'📉 تجنب الشراء العاطفي: انتظر 24 ساعة قبل الشراء',
	'🔄 راجع اشتراكاتك الشهرية – قد توفر مبلغاً لا بأس به',
	'💰 حول المصروفات التلقائية إلى فرص ادخارية',
	'📈 استثمر فائض دخلك في أصول تنموية',
	'⏳ التحليل العميق قد يستغرق حتى دقيقة... شكراً لصبرك',
];

const MAX_RETRIES = 3;
const BASE_DELAY = 1500;

export function AIFinancialAnalysis({ className = '', autoFetch = true }) {
	const [selectedMonths, setSelectedMonths] = useState(6);
	const [data, setData] = useState<AnalysisData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [tipIndex, setTipIndex] = useState(0);
	const [retryMessage, setRetryMessage] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);
	// refs لمنع التحميل المزدوج
	const isFirstMount = useRef(true);
	const isChangingMonths = useRef(false);

	// تغيير النصائح أثناء التحميل
	useEffect(() => {
		if (loading) {
			tipIntervalRef.current = setInterval(() => {
				setTipIndex((prev) => (prev + 1) % loadingTips.length);
			}, 2000);
		} else {
			if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
		}
		return () => {
			if (tipIntervalRef.current) clearInterval(tipIntervalRef.current);
		};
	}, [loading]);

	const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const fetchAnalysis = useCallback(
		async (forceRefresh = false, retriesLeft = MAX_RETRIES) => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			const controller = new AbortController();
			abortControllerRef.current = controller;
			const { signal } = controller;

			setLoading(true);
			setError(null);
			setRetryMessage(null);

			try {
				const timeoutId = setTimeout(() => controller.abort(), 50000);
				const url = `/api/ai/financial-analysis?months=${selectedMonths}${forceRefresh ? '&refresh=true' : ''}`;
				const res = await fetch(url, {
					signal,
					headers: { 'Cache-Control': 'no-cache' },
				});
				clearTimeout(timeoutId);

				if (!mountedRef.current) return;

				const result = await res.json();
				if (!result.ok) throw new Error(result.error || 'فشل التحليل');

				setData(result.data);
				localStorage.setItem('last_ai_analysis', JSON.stringify(result.data));
				setError(null);
			} catch (err: any) {
				if (!mountedRef.current) return;

				if (err.name === 'AbortError') {
					if (retriesLeft > 1) {
						setRetryMessage(
							`انتهت المهلة، إعادة المحاولة (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})...`
						);
						await delay(BASE_DELAY * (MAX_RETRIES - retriesLeft + 1));
						if (mountedRef.current) fetchAnalysis(forceRefresh, retriesLeft - 1);
					} else {
						setError('استغرق الطلب وقتاً طويلاً جداً. يرجى المحاولة لاحقاً.');
					}
				} else if (retriesLeft > 1) {
					setRetryMessage(
						`حدث خطأ، إعادة المحاولة (${MAX_RETRIES - retriesLeft + 1}/${MAX_RETRIES})...`
					);
					await delay(BASE_DELAY * (MAX_RETRIES - retriesLeft + 1));
					if (mountedRef.current) fetchAnalysis(forceRefresh, retriesLeft - 1);
				} else {
					setError(err.message || 'حدث خطأ، حاول لاحقاً');
				}
			} finally {
				if (mountedRef.current && abortControllerRef.current === controller) {
					setLoading(false);
					setRetryMessage(null);
					abortControllerRef.current = null;
				}
			}
		},
		[selectedMonths]
	);

	// useEffect واحد مسؤول عن جلب البيانات عند التثبيت أو تغيير selectedMonths
	useEffect(() => {
		if (!autoFetch) return;

		// منع التحميل المزدوج عند التثبيت الأول
		if (isFirstMount.current) {
			isFirstMount.current = false;
			fetchAnalysis(false);
			return;
		}

		// إذا كان التغيير قادماً من handleMonthsChange، نقوم بالجلب مرة واحدة فقط
		if (isChangingMonths.current) {
			isChangingMonths.current = false;
			fetchAnalysis(false);
			return;
		}

		// أي تغيير آخر (نادر) – نمنعه لتجنب التحميل المزدوج
		// ولكننا سنتركه آمناً بدون تنفيذ
	}, [selectedMonths, autoFetch, fetchAnalysis]);

	// useEffect منفصل للتحقق من الاتصال (offline) لا يؤثر على التحميل
	useEffect(() => {
		if (!navigator.onLine) {
			const cached = localStorage.getItem('last_ai_analysis');
			if (cached) {
				try {
					const parsed = JSON.parse(cached);
					setData({ ...parsed, isInsufficientData: parsed.isInsufficientData || false });
					setError('أنت غير متصل بالإنترنت. يعرض آخر تحليل محفوظ.');
				} catch (e) {}
			}
		}
	}, []);

	const handleRefresh = () => {
		fetchAnalysis(true);
	};

	const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newMonths = parseInt(e.target.value, 10);
		if (newMonths === selectedMonths) return;
		// نضع علامة أننا بصدد تغيير الأشهر يدوياً
		isChangingMonths.current = true;
		setSelectedMonths(newMonths);
	};

	// عرض التحميل ...
	if (loading) {
		return (
			<Card
				className={`overflow-hidden border-emerald-500/20 bg-slate-950/50 backdrop-blur-xl ${className}`}
			>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="relative">
								<BrainCircuit className="h-6 w-6 text-emerald-400 animate-pulse" />
								<div className="absolute inset-0 blur-lg bg-emerald-400/50 animate-pulse" />
							</div>
							<Skeleton className="h-6 w-48 bg-slate-800" />
						</div>
						<Skeleton className="h-10 w-28 bg-slate-800 rounded-lg" />
					</div>
				</CardHeader>
				<CardContent className="space-y-6 px-4 sm:px-6">
					<div className="flex flex-col items-center justify-center py-4 gap-4">
						<Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
						<motion.p
							key={tipIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-sm text-emerald-300/80 text-center max-w-xs leading-relaxed"
						>
							{loadingTips[tipIndex]}
						</motion.p>
					</div>
					<div className="space-y-4">
						<Skeleton className="h-24 w-full bg-slate-800/40 rounded-2xl" />
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<Skeleton className="h-32 w-full bg-slate-800/40 rounded-2xl" />
							<Skeleton className="h-32 w-full bg-slate-800/40 rounded-2xl" />
							<Skeleton className="h-32 w-full bg-slate-800/40 rounded-2xl" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (data?.isInsufficientData) {
		return (
			<Card className={`border-amber-500/20 bg-slate-950/40 backdrop-blur-xl ${className}`}>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2 text-amber-400 text-lg">
						<span className="flex items-center gap-2">
							<Sparkles className="h-5 w-5" />
							تحليل ذكي قيد التحضير
						</span>
						<select
							value={selectedMonths}
							onChange={handleMonthsChange}
							className="bg-slate-800 border border-amber-500/30 rounded-lg px-3 py-1 text-sm text-white focus:outline-none"
						>
							{[...Array(12)].map((_, i) => (
								<option key={i} value={i + 1}>
									آخر {i + 1} شهر
								</option>
							))}
						</select>
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 sm:px-6">
					<Alert className="bg-amber-500/5 border-amber-500/20 rounded-2xl">
						<AlertDescription className="text-amber-100/90 leading-relaxed">
							{data.raw_summary}
						</AlertDescription>
					</Alert>
					<Button
						onClick={handleRefresh}
						className="mt-6 w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20 rounded-xl"
					>
						<RefreshCw className="ml-2 h-4 w-4" /> تحديث البيانات
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (error && !data) {
		return (
			<Card className="border-red-500/20 bg-slate-950/40">
				<CardContent className="p-6 text-center">
					<AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
					<h3 className="text-white font-bold mb-2">عذراً، حدث خطأ ما</h3>
					<p className="text-slate-400 text-sm mb-6">{error}</p>
					<Button
						onClick={handleRefresh}
						variant="outline"
						className="border-red-500/30 text-red-400"
					>
						إعادة المحاولة
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const healthStyles = data.financial_health.includes('ممتاز')
		? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10'
		: data.financial_health.includes('جيد')
			? 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400 shadow-blue-500/10'
			: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400 shadow-amber-500/10';

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			className={`w-full group ${className}`}
		>
			<Card className="relative overflow-hidden border-white/5 bg-slate-900/60 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-emerald-500/20">
				{/* AI Glow Effect */}
				<div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
				<div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

				<CardHeader
					className="pb-4 cursor-pointer select-none px-4 sm:px-6"
					onClick={() => setExpanded(!expanded)}
				>
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-600/20 border border-white/10">
								<BrainCircuit className="h-6 w-6 text-emerald-400" />
							</div>
							<div>
								<CardTitle className="text-lg font-bold text-white tracking-tight">
									التحليل الذكي{' '}
									<span className="text-emerald-400 font-light opacity-80">FinAI</span>
								</CardTitle>
								<div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
									<Clock className="h-3 w-3" />
									{new Date(data.generated_at).toLocaleString('ar-EG', {
										hour: '2-digit',
										minute: '2-digit',
									})}
									<span className="flex items-center gap-1 text-emerald-500/70">
										<ShieldCheck className="h-3 w-3" /> مشفر وآمن
									</span>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
							{/* قائمة اختيار عدد الأشهر */}
							<select
								value={selectedMonths}
								onChange={handleMonthsChange}
								className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
								onClick={(e) => e.stopPropagation()}
							>
								{[...Array(12)].map((_, i) => (
									<option key={i} value={i + 1}>
										آخر {i + 1} شهر
									</option>
								))}
							</select>
							{/* <Badge
								className={`px-3 py-1.5 rounded-lg border bg-gradient-to-tr ${healthStyles} font-bold`}
							>
								{data.financial_health}
							</Badge> */}
							<div className="p-1.5 rounded-full bg-white/5 text-slate-400">
								{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
							</div>
						</div>
					</div>
				</CardHeader>

				<AnimatePresence>
					{expanded && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.4, ease: 'circOut' }}
						>
							<CardContent className="space-y-6 pt-0 px-4 sm:px-6 pb-6">
								<Badge
									className={`px-3 py-5 rounded-lg border bg-gradient-to-tr ${healthStyles} font-bold whitespace-normal break-words text-right`}
								>
									{data.financial_health}
								</Badge>
								{/* Grid for Patterns & Savings */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									{/* Spending Patterns */}
									<div className="group/item relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
										<div className="flex items-center gap-2 mb-4 text-emerald-400">
											<TrendingDown size={18} />
											<h3 className="text-sm font-bold text-white">أنماط الإنفاق</h3>
										</div>
										<ul className="space-y-3">
											{data.spending_patterns.map((item, i) => (
												<li key={i} className="text-sm text-slate-300 flex gap-3 leading-relaxed">
													<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50" />
													{item}
												</li>
											))}
										</ul>
									</div>

									{/* Saving Opportunities */}
									<div className="group/item relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
										<div className="flex items-center gap-2 mb-4 text-blue-400">
											<PiggyBank size={18} />
											<h3 className="text-sm font-bold text-white">فرص الادخار</h3>
										</div>
										<ul className="space-y-3">
											{data.saving_opportunities.map((item, i) => (
												<li key={i} className="text-sm text-slate-300 flex gap-3 leading-relaxed">
													<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500/50" />
													{item}
												</li>
											))}
										</ul>
									</div>
								</div>

								{/* Risk Alerts if any */}
								{data.risk_alerts.length > 0 && (
									<motion.div
										initial={{ x: -10, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl"
									>
										<div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-sm">
											<AlertTriangle size={16} /> تنبيهات هامة
										</div>
										<div className="space-y-2">
											{data.risk_alerts.map((alert, i) => (
												<p key={i} className="text-xs text-red-200/80 mr-6 list-item break-words">
													{alert}
												</p>
											))}
										</div>
									</motion.div>
								)}

								{/* Summary Section */}
								<div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500/[0.07] to-blue-500/[0.07] border border-white/5">
									<div className="flex items-center gap-2 mb-3 text-white/90">
										<BarChart3 size={18} className="text-emerald-400" />
										<h3 className="text-sm font-bold">ملخص التوصيات الذكي</h3>
									</div>
									<p className="text-sm leading-relaxed text-slate-300 break-words whitespace-pre-wrap">
										{data.raw_summary}
									</p>
								</div>

								{/* Refresh Button */}
								<div className="flex justify-center pt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={handleRefresh}
										className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-full px-6 transition-all border border-transparent hover:border-emerald-500/20"
									>
										<RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
										تحديث التحليل اللحظي
									</Button>
								</div>
							</CardContent>
						</motion.div>
					)}
				</AnimatePresence>
			</Card>
		</motion.div>
	);
}
