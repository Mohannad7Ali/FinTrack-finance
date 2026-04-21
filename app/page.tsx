'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
	ArrowRight,
	Sparkles,
	TrendingUp,
	Wallet,
	PieChart,
	Shield,
	Zap,
	Heart,
} from 'lucide-react';

// مكون العدّ التصاعدي
function AnimatedNumber({
	target,
	suffix,
	prefix,
	duration = 2000,
}: {
	target: number;
	suffix?: string;
	prefix?: string;
	duration?: number;
}) {
	const [count, setCount] = useState(0);
	const [isVisible, setIsVisible] = useState(false);
	const elementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isVisible) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.3 }
		);
		if (elementRef.current) observer.observe(elementRef.current);
		return () => observer.disconnect();
	}, [isVisible]);

	useEffect(() => {
		if (!isVisible) return;
		let start = 0;
		const increment = target / (duration / 16);
		const timer = setInterval(() => {
			start += increment;
			if (start >= target) {
				setCount(target);
				clearInterval(timer);
			} else {
				setCount(Math.floor(start));
			}
		}, 16);
		return () => clearInterval(timer);
	}, [target, duration, isVisible]);

	return (
		<div ref={elementRef} className="space-y-1">
			<div className="text-xl md:text-2xl font-bold text-white">
				{prefix}
				{count.toLocaleString('ar-EG')}
				{suffix}
			</div>
			<div className="text-[11px] md:text-xs text-slate-400">{/* سيتم تمرير النص من الخارج */}</div>
		</div>
	);
}

// مكون الإحصائية الكامل
function StatCard({
	value,
	label,
}: {
	value: { numeric: number; prefix?: string; suffix?: string };
	label: string;
}) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isVisible) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.3 }
		);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [isVisible]);

	const [count, setCount] = useState(0);
	useEffect(() => {
		if (!isVisible) return;
		const target = value.numeric;
		let start = 0;
		const duration = 2000;
		const increment = target / (duration / 16);
		const timer = setInterval(() => {
			start += increment;
			if (start >= target) {
				setCount(target);
				clearInterval(timer);
			} else {
				setCount(Math.floor(start));
			}
		}, 16);
		return () => clearInterval(timer);
	}, [isVisible, value.numeric]);

	return (
		<div ref={ref} className="space-y-1 text-center">
			<div className="text-xl md:text-2xl font-bold text-white">
				{value.prefix}
				{count.toLocaleString('ar-EG')}
				{value.suffix}
			</div>
			<div className="text-[11px] md:text-xs text-slate-400">{label}</div>
		</div>
	);
}

export default function Home() {
	return (
		<main
			className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-x-hidden relative"
			dir="rtl"
		>
			{/* خلفية متحركة واضحة وجذابة */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-emerald-900/20 animate-gradient-x" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl animate-pulse-glow" />
				<div className="absolute top-20 left-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl animate-float-slow" />
				<div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-float-slow-delayed" />
				<div className="absolute top-1/3 right-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-float-fast" />
			</div>

			<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16 space-y-16 md:space-y-24">
				{/* Hero Section (نفسه بدون تغيير) */}
				<div className="text-center space-y-5 md:space-y-6">
					<div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-emerald-400 animate-fade-in">
						<Sparkles className="w-3.5 h-3.5" />
						تحكم مالي ذكي
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
						أدر أموالك
						<span className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 bg-clip-text text-transparent py-1">
							بوضوح وسهولة
						</span>
					</h1>
					<p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto px-2">
						تابع إيراداتك ومصروفاتك، نظمها حسب الفئات، راقب الأرصدة في الوقت الفعلي، واتخذ قرارات
						مالية أذكى.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
						<Link
							href="/register"
							className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
						>
							ابدأ مجاناً
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
						</Link>
						<Link
							href="/login"
							className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 rounded-xl border border-white/15 bg-white/5 text-slate-200 font-medium backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
						>
							لدي حساب بالفعل
						</Link>
					</div>
				</div>

				{/* إحصائيات مع العدّ التصاعدي */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center border-y border-white/10 py-6 md:py-8">
					<StatCard value={{ numeric: 100, suffix: '%' }} label="مجاني بالكامل" />
					<StatCard value={{ numeric: 5, prefix: '+', suffix: ' آلاف' }} label="مستخدم نشط" />
					<StatCard
						value={{ numeric: 100, prefix: '+', suffix: ' مليون' }}
						label="قيد المراقبة (ل.س)"
					/>
					<div className="space-y-1">
						<div className="text-xl md:text-2xl font-bold text-white">24/7</div>
						<div className="text-[11px] md:text-xs text-slate-400">متاح دائماً</div>
					</div>
				</div>

				{/* بقية المكونات (المميزات، CTA، التذييل) - بدون تغيير */}
				<div className="space-y-6">
					<div className="text-center space-y-2">
						<h2 className="text-xl md:text-3xl font-bold text-white">كل ما تحتاجه</h2>
						<p className="text-xs md:text-sm text-slate-400">تحكم كامل بأموالك في مكان واحد</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
						<FeatureCard
							icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="رؤية واضحة"
							description="تعرف بسرعة على إجمالي دخلك ومصروفاتك ورصيدك الحالي من خلال رسوم بيانية بديهية."
						/>
						<FeatureCard
							icon={<Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="تنظيم المحافظ"
							description="أنشئ محافظ متعددة (نقدي، بنك، استثمارات) وتابع كل منها بشكل منفصل."
						/>
						<FeatureCard
							icon={<PieChart className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="فئات ذكية"
							description="صنف نفقاتك حسب فئات مخصصة وتعرف أين تذهب أموالك حقاً."
						/>
						<FeatureCard
							icon={<Zap className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="سريع ومتجانس"
							description="واجهة خفيفة ومحسّنة للجوال والحاسوب مع استجابة فورية."
						/>
						<FeatureCard
							icon={<Shield className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="آمن وخاص"
							description="بياناتك مشفرة ولا يطلع عليها سواك – حتى نحن لا نرى كلمات مرورك."
						/>
						<FeatureCard
							icon={<Sparkles className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />}
							title="تحديثات مستمرة"
							description="نضيف باستمرار ميزات جديدة لتسهيل حياتك المالية."
						/>
					</div>
				</div>

				<div className="text-center space-y-4 md:space-y-6 bg-gradient-to-r from-emerald-900/20 to-slate-900/20 rounded-xl md:rounded-2xl border border-white/10 p-6 md:p-10">
					<h2 className="text-xl md:text-3xl font-bold text-white">
						هل أنت مستعد لفرض السيطرة على أموالك؟
					</h2>
					<p className="text-xs md:text-sm text-slate-300 max-w-lg mx-auto">
						انضم إلى آلاف الأشخاص الذين يتحكمون في أموالهم بذكاء.
					</p>
					<Link
						href="/register"
						className="inline-flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5 text-sm md:text-base"
					>
						أنشأ حسابك الآن مجاني تماماً <ArrowRight className="w-4 h-4" />
					</Link>
					<p className="text-[10px] md:text-xs text-slate-500">
						بدون التزام، ولا حاجة لبطاقة ائتمان.
					</p>
				</div>

				<footer className="text-center border-t border-white/10 pt-6 md:pt-8 space-y-3">
					<p className="text-xs md:text-sm text-slate-400 flex items-center justify-center gap-1 flex-wrap">
						<a
							href="https://mohannad-ali-portfolio.vercel.app/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-emerald-400 hover:text-emerald-300 transition underline decoration-emerald-400/30 hover:decoration-emerald-400/80"
						>
							Mohannad Ali
						</a>
						Made With ❤{' '}
						{/* <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400 inline fill-red-400 animate-pulse" /> */}
						by
					</p>
					<p className="text-[10px] md:text-xs text-slate-500">
						© {new Date().getFullYear()} FinTrack. All rights reserved.
					</p>
				</footer>
			</div>

			<style jsx>{`
				@keyframes fade-in {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes gradient-x {
					0%,
					100% {
						background-position: 0% 50%;
					}
					50% {
						background-position: 100% 50%;
					}
				}
				@keyframes pulse-glow {
					0%,
					100% {
						opacity: 0.1;
						transform: scale(1) translate(-50%, -50%);
					}
					50% {
						opacity: 0.25;
						transform: scale(1.1) translate(-50%, -50%);
					}
				}
				@keyframes float-slow {
					0%,
					100% {
						transform: translate(0, 0);
					}
					50% {
						transform: translate(20px, -20px);
					}
				}
				@keyframes float-slow-delayed {
					0%,
					100% {
						transform: translate(0, 0);
					}
					50% {
						transform: translate(-20px, 20px);
					}
				}
				@keyframes float-fast {
					0%,
					100% {
						transform: translate(0, 0);
					}
					50% {
						transform: translate(15px, -15px);
					}
				}
				.animate-fade-in {
					animation: fade-in 0.6s ease-out;
				}
				.animate-gradient-x {
					animation: gradient-x 12s ease infinite;
					background-size: 200% 100%;
				}
				.animate-pulse-glow {
					animation: pulse-glow 6s ease-in-out infinite;
				}
				.animate-float-slow {
					animation: float-slow 8s ease-in-out infinite;
				}
				.animate-float-slow-delayed {
					animation: float-slow-delayed 10s ease-in-out infinite;
				}
				.animate-float-fast {
					animation: float-fast 6s ease-in-out infinite;
				}
			`}</style>
		</main>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="group relative overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 md:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10">
			<div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			<div className="mb-2 md:mb-3">{icon}</div>
			<h3 className="text-base md:text-lg font-semibold text-white mb-1">{title}</h3>
			<p className="text-xs md:text-sm text-slate-400">{description}</p>
		</div>
	);
}
