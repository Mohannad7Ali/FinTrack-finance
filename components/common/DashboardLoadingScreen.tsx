// components/common/LoadingScreen.tsx
'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
			<div className="relative w-20 h-20 mx-auto">
				<div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
				<div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
				<div className="absolute inset-2 rounded-full border-2 border-emerald-500/30 border-b-transparent animate-spin-slow" />
			</div>
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="mt-6 text-center"
			>
				<p className="text-slate-200 text-lg font-medium">جاري تحميل البيانات</p>
				<p className="text-slate-400 text-sm mt-1">يرجى الانتظار قليلاً...</p>
			</motion.div>
			<div className="flex justify-center gap-2 mt-4">
				<motion.div
					className="w-2 h-2 bg-emerald-400 rounded-full"
					animate={{ y: [0, -8, 0] }}
					transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
				/>
				<motion.div
					className="w-2 h-2 bg-emerald-400 rounded-full"
					animate={{ y: [0, -8, 0] }}
					transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
				/>
				<motion.div
					className="w-2 h-2 bg-emerald-400 rounded-full"
					animate={{ y: [0, -8, 0] }}
					transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
				/>
			</div>
		</div>
	);
}
