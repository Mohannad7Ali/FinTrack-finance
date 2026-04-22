'use client';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, BarChart3, Sparkles } from 'lucide-react';

interface QuickStartGuideModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function QuickStartGuideModal({ open, onOpenChange }: QuickStartGuideModalProps) {
	const steps = [
		{
			icon: <PlusCircle className="w-8 h-8 text-emerald-400" />,
			title: 'أضف معاملة جديدة',
			description:
				'سجل دخلك أو مصروفك ببساطة من زر "تسجيل معاملة جديدة". اختر النوع، المبلغ، الفئة، والمحفظة.',
		},
		{
			icon: <Wallet className="w-8 h-8 text-blue-400" />,
			title: 'نظّم محافظك',
			description: 'يمكنك إنشاء محافظ متعددة (نقدي، بنك، استثمار) وتخصيص العملة لكل محفظة.',
		},
		{
			icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
			title: 'تابع دخلك ومصروفاتك',
			description: 'سترى ملخصات فورية على شكل بطاقات ورسوم بيانية توضح أين تذهب أموالك.',
		},
		{
			icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
			title: 'حلل بياناتك',
			description:
				'استخدم الرسوم البيانية الدائرية والخطية لفهم الاتجاهات اليومية وتوزيع المصروفات.',
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
						<Sparkles className="w-6 h-6 text-emerald-400" />
						دليل البدء السريع
					</DialogTitle>
					<DialogDescription className="text-center text-slate-400">
						في 4 خطوات بسيطة، ستصبح خبيراً في إدارة أموالك
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{steps.map((step, index) => (
						<div key={index} className="flex gap-4 items-start">
							<div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
								{step.icon}
							</div>
							<div className="flex-1">
								<h4 className="text-lg font-semibold text-white flex items-center gap-2">
									{index + 1}. {step.title}
								</h4>
								<p className="text-slate-400 text-sm mt-1">{step.description}</p>
							</div>
						</div>
					))}
				</div>

				<div className="mt-6 flex justify-center">
					<Button
						onClick={() => onOpenChange(false)}
						className="bg-emerald-600 hover:bg-emerald-500"
					>
						هيا بنا نبدأ ✨
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
