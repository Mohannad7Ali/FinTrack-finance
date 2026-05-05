import { Wrench, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MaintenancePage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
			<div className="text-center max-w-md">
				<div className="mb-6 flex justify-center">
					<div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
						<Wrench className="h-12 w-12 text-amber-600 dark:text-amber-400" />
					</div>
				</div>
				<h1 className="text-3xl font-bold">نعمل على تحسين التطبيق</h1>
				<p className="text-muted-foreground mt-2">
					نقوم حالياً بإجراء صيانة دورية. سنعود قريباً مع تجربة أفضل.
				</p>
				<div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<Clock className="h-4 w-4" />
					<span>المدة المتوقعة: بضع ساعات</span>
				</div>
				<Button asChild variant="outline" className="mt-6">
					<Link href="/">تحديث الصفحة</Link>
				</Button>
			</div>
		</div>
	);
}
