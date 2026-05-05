import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://fintrack.vercel.app'; // غيّر إلى رابطك الفعلي

	// الصفحات الثابتة الرئيسية (العامة)
	const staticPages = ['', '/login', '/register', '/forgot-password'].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: route === '' ? 1.0 : 0.8,
	}));

	// الصفحات المحمية (قد لا يراها الزوار غير المسجلين لكنها مفيدة لتحسين الفهرسة)
	const protectedPages = [
		'/dashboard',
		'/transactions',
		'/wallets',
		'/categories',
		'/reports',
		'/settings',
	].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date(),
		changeFrequency: 'daily' as const,
		priority: 0.9,
	}));

	return [...staticPages, ...protectedPages];
}
