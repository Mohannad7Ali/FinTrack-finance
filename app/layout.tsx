import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
	title: 'متعقب المصاريف - إدارة مالية سهلة',
	description:
		'تطبيق ويب لإدارة المصاريف الشخصية والمشاريع بسهولة وسرعة. تتبع المصاريف، الإيرادات، والميزانيات في واجهة عربية متكاملة.',
	keywords: ['مصروفات', 'ميزانية', 'إدارة مالية', 'تطبيق عربي', 'Expense Tracker', 'SaaS'],
	authors: [{ name: 'Mohannad Ali', url: 'https://mohannad-ali-portfolio.vercel.app' }],
	creator: 'Mohannad Ali',
	publisher: 'Mohannad Ali',
	metadataBase: new URL('https://your-project-domain.com'), // استبدل هذا بالرابط الفعلي لمشروعك
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
	variable: '--font-cairo', // هذا الاسم يجب أن يطابق ما وضعناه في ملف CSS
	display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ar" dir="rtl" className={cairo.variable}>
			<body className="font-sans">{children}</body>
		</html>
	);
}
