import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
export const metadata: Metadata = {
	title: 'FinTrack | إدارة مالية ذكية وسهلة',
	description:
		'تطبيق ويب متكامل لإدارة المصاريف والإيرادات والميزانيات الشخصية. تتبع أموالك بدقة مع واجهة عربية سلسة.',
	keywords: [
		'FinTrack',
		'متعقب المصاريف',
		'إدارة مالية',
		'تطبيق عربي',
		'Expense Tracker',
		'ميزانية',
	],
	authors: [{ name: 'Mohannad Ali', url: 'https://mohannad-ali-portfolio.vercel.app' }],
	creator: 'Mohannad Ali',
	publisher: 'Mohannad Ali',
	metadataBase: new URL('https://fintrack.vercel.app'), // غيّر إلى رابط مشروعك الفعلي
	alternates: {
		canonical: '/',
		languages: {
			ar: '/',
		},
	},
	openGraph: {
		title: 'FinTrack | إدارة مالية ذكية وسهلة',
		description:
			'تطبيق ويب متكامل لإدارة المصاريف والإيرادات والميزانيات الشخصية. تتبع أموالك بدقة مع واجهة عربية سلسة.',
		url: 'https://fintrack.vercel.app',
		siteName: 'FinTrack',
		images: [
			{
				url: 'https://fintrack.vercel.app/og-image.png',
				width: 1200,
				height: 630,
				alt: 'FinTrack - لوحة التحكم المالية',
			},
		],
		locale: 'ar_AR',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'FinTrack | إدارة مالية ذكية وسهلة',
		description:
			'تطبيق ويب متكامل لإدارة المصاريف والإيرادات والميزانيات الشخصية. تتبع أموالك بدقة مع واجهة عربية سلسة.',
		images: ['https://fintrack.vercel.app/og-image.png'],
		creator: '@mohannad_ali',
	},
	manifest: '/manifest.json',
	// themeColor: '#0f172a',
	icons: {
		icon: '/icons/icon-192.png',
		apple: '/icons/apple-touch-icon.png',
	},
};

const cairo = Cairo({
	subsets: ['arabic', 'latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-cairo',
	display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="ar"
			dir="rtl"
			suppressHydrationWarning
			className={cn(cairo.variable, 'dark overflow-x-hidden w-full')}
		>
			<body className="font-sans overflow-x-hidden w-full" suppressHydrationWarning>
				<Providers> {children}</Providers>

				<Toaster
					position="bottom-right"
					reverseOrder={false}
					gutter={8}
					toastOptions={{
						duration: 5000,
						style: {
							background: '#363636',
							color: '#fff',
						},
						success: {
							duration: 3000,
							iconTheme: {
								primary: 'green',
								secondary: 'black',
							},
						},
					}}
				/>
			</body>
		</html>
	);
}
