'use client';

import Link from 'next/link';
import { Home, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
			<div className="text-center max-w-md">
				<div className="mb-6">
					<div className="text-9xl font-bold text-slate-300 dark:text-slate-700">404</div>
					<div className="text-2xl font-semibold mt-2">الصفحة غير موجودة</div>
					<p className="text-muted-foreground mt-2">
						عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button asChild variant="default">
						<Link href="/dashboard">
							<Home className="ml-2 h-4 w-4" />
							لوحة التحكم
						</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/">
							<ArrowRight className="ml-2 h-4 w-4" />
							الرئيسية
						</Link>
					</Button>
				</div>

				<div className="mt-8 text-sm text-muted-foreground">
					أو يمكنك استخدام <Search className="inline h-3 w-3" /> البحث للعثور على ما تريد.
				</div>
			</div>
		</div>
	);
}
