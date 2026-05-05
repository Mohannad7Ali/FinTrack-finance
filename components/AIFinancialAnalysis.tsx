'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	BrainCircuit,
	TrendingDown,
	PiggyBank,
	AlertTriangle,
	RefreshCw,
	ChevronDown,
	ChevronUp,
	WifiOff,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

export function AIFinancialAnalysis({ className = '', autoFetch = true, months = 6 }) {
	const [data, setData] = useState<AnalysisData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(true);
	const [tipIndex, setTipIndex] = useState(0);
	const [retryMessage, setRetryMessage] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const tipIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		if (loading) {
			tipIntervalRef.current = setInterval(() => {
				setTipIndex((prev) => (prev + 1) % loadingTips.length);
			}, 4000);
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
				// 🔁 إضافة معامل refresh=true إذا كان مطلوباً
				const url = `/api/ai/financial-analysis?months=${months}${forceRefresh ? '&refresh=true' : ''}`;
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
		[months]
	);

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

	useEffect(() => {
		mountedRef.current = true;
		if (autoFetch) fetchAnalysis(false); // التحميل الأول بدون forceRefresh
		return () => {
			mountedRef.current = false;
			if (abortControllerRef.current) abortControllerRef.current.abort();
		};
	}, [autoFetch, fetchAnalysis]);

	// دالة مخصصة لزر التحديث: تمرير forceRefresh = true
	const handleRefresh = () => {
		fetchAnalysis(true);
	};

	// ------------------- باقي حالات العرض -------------------
	if (loading) {
		return (
			<Card
				className={`overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm shadow-2xl ${className}`}
			>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-emerald-300">
						<BrainCircuit className="h-5 w-5 animate-pulse" />
						<span className="bg-gradient-to-r from-emerald-300 to-blue-400 bg-clip-text text-transparent">
							التحليل المالي بالذكاء الاصطناعي
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-5">
					<div className="flex justify-center py-2">
						<Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
					</div>
					{retryMessage ? (
						<div className="text-center text-amber-400 text-sm">{retryMessage}</div>
					) : (
						<motion.div
							key={tipIndex}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl text-sm flex items-start gap-3"
						>
							<Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
							<p className="text-slate-300">{loadingTips[tipIndex]}</p>
						</motion.div>
					)}
					<div className="space-y-3">
						<Skeleton className="h-20 w-full bg-slate-800/50 rounded-xl" />
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<Skeleton className="h-28 w-full bg-slate-800/50 rounded-xl" />
							<Skeleton className="h-28 w-full bg-slate-800/50 rounded-xl" />
							<Skeleton className="h-28 w-full bg-slate-800/50 rounded-xl" />
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (data?.isInsufficientData) {
		return (
			<Card
				className={`border-emerald-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-sm shadow-xl ${className}`}
			>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-amber-400">
						<BrainCircuit className="h-5 w-5" />
						تحليل مالي – بيانات غير كافية
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert className="bg-amber-950/30 border-amber-500/30">
						<AlertTriangle className="h-4 w-4 text-amber-400" />
						<AlertTitle className="text-amber-300">مرحباً بك في FinTrack</AlertTitle>
						<AlertDescription className="text-amber-200/80">
							<p>{data.raw_summary}</p>
							<div className="mt-3">
								<Button
									size="sm"
									variant="outline"
									onClick={handleRefresh}
									className="gap-2 border-amber-500/50 text-amber-300 hover:bg-amber-950/50"
								>
									<RefreshCw className="h-3 w-3" /> تحديث بعد الإضافة
								</Button>
							</div>
						</AlertDescription>
					</Alert>
					<div className="text-center text-xs text-slate-400 pt-2">
						💡 بعد إضافة 3 مصروفات على الأقل، سيظهر تحليل ذكي شامل.
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error && !data) {
		return (
			<Card
				className={`border-red-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm ${className}`}
			>
				<CardContent className="pt-6">
					<Alert variant="destructive" className="bg-red-950/30 border-red-500/30">
						<AlertTriangle className="h-4 w-4 text-red-400" />
						<AlertTitle className="text-red-300">تعذر الحصول على التحليل</AlertTitle>
						<AlertDescription className="space-y-3">
							<p className="text-red-200/80">{error}</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleRefresh}
									className="gap-2 border-red-500/50 text-red-300 hover:bg-red-950/50"
								>
									<RefreshCw className="h-3 w-3" /> إعادة المحاولة
								</Button>
								{!navigator.onLine && (
									<Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
										<WifiOff className="h-3 w-3 ml-1" /> غير متصل
									</Badge>
								)}
							</div>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	const healthColor = data.financial_health.includes('ممتاز')
		? 'from-emerald-600/20 to-emerald-800/30 border-emerald-500/40 text-emerald-300'
		: data.financial_health.includes('جيد')
			? 'from-blue-600/20 to-blue-800/30 border-blue-500/40 text-blue-300'
			: data.financial_health.includes('ضعيف')
				? 'from-red-600/20 to-red-800/30 border-red-500/40 text-red-300'
				: 'from-amber-600/20 to-amber-800/30 border-amber-500/40 text-amber-300';

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			<Card
				className={`group relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 backdrop-blur-sm shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 ${className}`}
			>
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

				<CardHeader
					className="pb-2 cursor-pointer relative z-10"
					onClick={() => setExpanded(!expanded)}
				>
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-lg bg-emerald-500/10">
								<BrainCircuit className="h-5 w-5 text-emerald-400" />
							</div>
							<CardTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
								التحليل المالي بالذكاء الاصطناعي
							</CardTitle>
						</div>
						<div className="flex items-center gap-2 self-end sm:self-auto">
							<Badge
								className={`bg-gradient-to-r ${healthColor} border px-2 py-0.5 text-xs font-medium`}
							>
								{data.financial_health}
							</Badge>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 p-0 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
							>
								{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
							</Button>
						</div>
					</div>
					<div className="flex justify-between items-center mt-1 text-xs text-slate-400">
						<div className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							<span>{new Date(data.generated_at).toLocaleString('ar-EG')}</span>
						</div>
						<div className="flex items-center gap-1">
							<ShieldCheck className="h-3 w-3 text-emerald-400" />
							<span>تحليل فوري</span>
						</div>
					</div>
				</CardHeader>

				<AnimatePresence>
					{expanded && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
						>
							<CardContent className="space-y-5 pt-0 relative z-10">
								{data.spending_patterns.length > 0 && (
									<div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
										<div className="flex items-center gap-2 mb-3">
											<div className="p-1 rounded bg-emerald-500/10">
												<TrendingDown className="h-4 w-4 text-emerald-400" />
											</div>
											<h3 className="font-semibold text-sm text-white">أنماط الإنفاق الرئيسية</h3>
										</div>
										<ul className="space-y-2 pr-4">
											{data.spending_patterns.map((p, i) => (
												<li key={i} className="text-sm text-slate-300 flex items-start gap-2">
													<span className="text-emerald-400 text-xs">•</span>
													{p}
												</li>
											))}
										</ul>
									</div>
								)}

								{data.saving_opportunities.length > 0 && (
									<div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
										<div className="flex items-center gap-2 mb-3">
											<div className="p-1 rounded bg-emerald-500/10">
												<PiggyBank className="h-4 w-4 text-emerald-400" />
											</div>
											<h3 className="font-semibold text-sm text-white">فرص التوفير المقترحة</h3>
										</div>
										<ul className="space-y-2 pr-4">
											{data.saving_opportunities.map((o, i) => (
												<li key={i} className="text-sm text-slate-300 flex items-start gap-2">
													<span className="text-emerald-400 text-xs">•</span>
													{o}
												</li>
											))}
										</ul>
									</div>
								)}

								{data.risk_alerts.length > 0 && (
									<Alert className="bg-red-950/20 border-red-500/30 text-red-200">
										<AlertTriangle className="h-4 w-4 text-red-400" />
										<AlertTitle className="text-red-300 text-sm font-semibold">
											تنبيهات مالية
										</AlertTitle>
										<AlertDescription>
											<ul className="space-y-1 pr-4 mt-1">
												{data.risk_alerts.map((r, i) => (
													<li key={i} className="text-xs text-red-200/80 flex items-start gap-2">
														<span className="text-red-400 text-xs">⚠</span>
														{r}
													</li>
												))}
											</ul>
										</AlertDescription>
									</Alert>
								)}

								<div className="border-t border-white/10 pt-4">
									<div className="flex items-center gap-2 mb-2">
										<BarChart3 className="h-4 w-4 text-emerald-400" />
										<h3 className="font-semibold text-sm text-white">الملخص والتوصيات</h3>
									</div>
									<p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
										{data.raw_summary}
									</p>
								</div>

								<div className="flex justify-start pt-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={handleRefresh} // ✅ استدعاء الدالة التي تفرض التحديث
										className="gap-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-all"
									>
										<RefreshCw className="h-3.5 w-3.5" />
										تحديث التحليل
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
