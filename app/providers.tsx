'use client';

import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export function Providers({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// محاكاة وقت التحميل (يمكن استبداله بفحص جلسة المستخدم أو تحميل البيانات)
		const timer = setTimeout(() => setIsLoading(false), 1500);
		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			<LoadingScreen isLoading={isLoading} minDisplayTime={800} />
			{!isLoading && children}
		</>
	);
}
