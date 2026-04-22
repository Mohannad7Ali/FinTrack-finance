import type { NextConfig } from 'next';

// استيراد المكتبة باستخدام require لتجنب تضارب أنواع TypeScript المعقدة
const withPWAFn = require('next-pwa');

const withPWA = withPWAFn({
	dest: 'public',
	register: true,
	skipWaiting: true,
	// تعطيل PWA في وضع التطوير لتجنب مشاكل التحديث المستمر للكاش
	disable: process.env.NODE_ENV === 'development',
	runtimeCaching: [
		// الصفحات الرئيسية
		{
			urlPattern: /^https?:\/\/[^/]+(\/|(\/dashboard|\/exchange|\/weather))?$/,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'pages-cache',
				expiration: { maxEntries: 10, maxAgeSeconds: 24 * 60 * 60 },
			},
		},
		// أسعار الصرف
		{
			urlPattern: /^https?:\/\/.*(exchangerate|currency|fixer).*\/.*$/i,
			handler: 'StaleWhileRevalidate',
			options: {
				cacheName: 'exchange-rates',
				expiration: { maxEntries: 5, maxAgeSeconds: 6 * 60 * 60 },
			},
		},
		// الطقس
		{
			urlPattern: /^https?:\/\/.*(openweathermap|weather).*\/.*$/i,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'weather-cache',
				expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 },
			},
		},
		// API الخاصة بك
		{
			urlPattern: /^\/api\/.*$/,
			handler: 'NetworkFirst',
			options: {
				cacheName: 'api-cache',
				expiration: { maxEntries: 30, maxAgeSeconds: 5 * 60 },
			},
		},
		// الملفات الثابتة (الصور والخطوط)
		{
			urlPattern: /\.(woff2|woff|ttf|eot|png|jpg|jpeg|svg|ico)$/,
			handler: 'CacheFirst',
			options: {
				cacheName: 'assets-cache',
				expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
			},
		},
	],
});

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// الحل الجذري لمشكلة Turbopack في إصدار Next.js 16
	// هذا يخبر Next.js أننا نستخدم Webpack عمداً لإضافاتنا
	experimental: {
		turbo: {
			// إبقاء الإعدادات فارغة هنا مع استخدام علم --webpack في التشغيل
		},
	} as any,

	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				pathname: '/**',
			},
		],
	},
};

// استخدام 'as any' ضروري جداً هنا لأن next-pwa لم تقم بتحديث أنواع i18n
// لتتوافق مع التغييرات الأخيرة في Next.js (خاصة مشكلة Readonly Domains)
export default withPWA(nextConfig as any);
