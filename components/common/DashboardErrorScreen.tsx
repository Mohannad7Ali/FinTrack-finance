// components/common/ErrorScreen.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorScreenProps {
	message: string;
	onRetry?: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
	const handleRetry = () => {
		if (onRetry) onRetry();
		else window.location.reload();
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center space-y-6"
			>
				<div className="bg-rose-500/20 p-4 rounded-full inline-flex mx-auto">
					<AlertCircle className="w-14 h-14 text-rose-400" />
				</div>
				<h2 className="text-2xl font-bold text-white">حدث خطأ</h2>
				<p className="text-slate-300 text-sm">{message}</p>
				<Button onClick={handleRetry} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
					<RefreshCw className="w-4 h-4" />
					إعادة المحاولة
				</Button>
			</motion.div>
		</div>
	);
}
