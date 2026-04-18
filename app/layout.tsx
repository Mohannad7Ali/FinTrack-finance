import type { Metadata } from 'next';
import { Cairo } from 'next/font/google'; // فقط Cairo
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: 'متعقب المصاريف - إدارة مالية سهلة',
	description:
		'تطبيق ويب لإدارة المصاريف الشخصية والمشاريع بسهولة وسرعة. تتبع المصاريف، الإيرادات، والميزانيات في واجهة عربية متكاملة.',
	keywords: ['مصروفات', 'ميزانية', 'إدارة مالية', 'تطبيق عربي', 'Expense Tracker', 'SaaS'],
	authors: [{ name: 'Mohannad Ali', url: 'https://mohannad-ali-portfolio.vercel.app' }],
	creator: 'Mohannad Ali',
	publisher: 'Mohannad Ali',
	metadataBase: new URL('https://your-project-domain.com'),
	alternates: {
		canonical: '/',
		languages: {
			ar: '/',
		},
	},
	openGraph: {
		title: 'متعقب المصاريف - إدارة مالية سهلة',
		description:
			'تطبيق ويب لإدارة المصاريف الشخصية والمشاريع بسهولة وسرعة. تتبع المصاريف، الإيرادات، والميزانيات في واجهة عربية متكاملة.',
		url: 'https://your-project-domain.com',
		siteName: 'متعقب المصاريف',
		images: [
			{
				url: 'https://your-project-domain.com/og-image.png',
				width: 1200,
				height: 630,
				alt: 'متعقب المصاريف',
			},
		],
		locale: 'ar_AR',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'متعقب المصاريف - إدارة مالية سهلة',
		description:
			'تطبيق ويب لإدارة المصاريف الشخصية والمشاريع بسهولة وسرعة. تتبع المصاريف، الإيرادات، والميزانيات في واجهة عربية متكاملة.',
		images: ['https://your-project-domain.com/og-image.png'],
		creator: '@mohannad_ali',
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
			className={cn(cairo.variable, 'dark')} // أضف 'dark' هنا و cairo.variable
		>
			<body className="font-sans" suppressHydrationWarning>
				{children}
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
