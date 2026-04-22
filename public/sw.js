if (!self.define) {
	let e,
		a = {};
	const s = (s, i) => (
		(s = new URL(s + '.js', i).href),
		a[s] ||
			new Promise((a) => {
				if ('document' in self) {
					const e = document.createElement('script');
					((e.src = s), (e.onload = a), document.head.appendChild(e));
				} else ((e = s), importScripts(s), a());
			}).then(() => {
				let e = a[s];
				if (!e) throw new Error(`Module ${s} didn’t register its module`);
				return e;
			})
	);
	self.define = (i, c) => {
		const t = e || ('document' in self ? document.currentScript.src : '') || location.href;
		if (a[t]) return;
		let n = {};
		const r = (e) => s(e, t),
			f = { module: { uri: t }, exports: n, require: r };
		a[t] = Promise.all(i.map((e) => f[e] || r(e))).then((e) => (c(...e), n));
	};
}
define(['./workbox-58cdce56'], function (e) {
	'use strict';
	(importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{
					url: '/_next/static/RYsjNNFPxpS9oPQ6BJbMu/_buildManifest.js',
					revision: '08daf5f5a9930153c39436914f1e71ad',
				},
				{
					url: '/_next/static/RYsjNNFPxpS9oPQ6BJbMu/_ssgManifest.js',
					revision: 'b6652df95db52feb4daf4eca35380933',
				},
				{ url: '/_next/static/chunks/1677-d2222cee2cfc57ff.js', revision: 'd2222cee2cfc57ff' },
				{ url: '/_next/static/chunks/1966.b8f83f7ba376c962.js', revision: 'b8f83f7ba376c962' },
				{ url: '/_next/static/chunks/3546-5cae015d400cbe53.js', revision: '5cae015d400cbe53' },
				{ url: '/_next/static/chunks/3794-154456079185e990.js', revision: '154456079185e990' },
				{ url: '/_next/static/chunks/3848-e229c9324e8b1738.js', revision: 'e229c9324e8b1738' },
				{ url: '/_next/static/chunks/3899.3f761f7e3a944e8c.js', revision: '3f761f7e3a944e8c' },
				{ url: '/_next/static/chunks/4845-4a109526473bcbb1.js', revision: '4a109526473bcbb1' },
				{ url: '/_next/static/chunks/4855-01493513a4a5953f.js', revision: '01493513a4a5953f' },
				{ url: '/_next/static/chunks/4bd1b696-e356ca5ba0218e27.js', revision: 'e356ca5ba0218e27' },
				{ url: '/_next/static/chunks/5772-2d538cc4a7c2ac4a.js', revision: '2d538cc4a7c2ac4a' },
				{ url: '/_next/static/chunks/6037-3032f98d6eceac8e.js', revision: '3032f98d6eceac8e' },
				{ url: '/_next/static/chunks/6056-145dcbe27f503a15.js', revision: '145dcbe27f503a15' },
				{ url: '/_next/static/chunks/6443-fa3bc2bc827f7ff4.js', revision: 'fa3bc2bc827f7ff4' },
				{ url: '/_next/static/chunks/6835-58fd5288e5e4e495.js', revision: '58fd5288e5e4e495' },
				{ url: '/_next/static/chunks/7317-1ab2ea6ee01158ae.js', revision: '1ab2ea6ee01158ae' },
				{ url: '/_next/static/chunks/7550-6613dc2acdfaade3.js', revision: '6613dc2acdfaade3' },
				{ url: '/_next/static/chunks/7584-f1d442c945b6ae0d.js', revision: 'f1d442c945b6ae0d' },
				{ url: '/_next/static/chunks/8491-793ad1f980aa6cac.js', revision: '793ad1f980aa6cac' },
				{ url: '/_next/static/chunks/8500-f62a38ff68ab7f42.js', revision: 'f62a38ff68ab7f42' },
				{ url: '/_next/static/chunks/8687-dccd0115817548a7.js', revision: 'dccd0115817548a7' },
				{ url: '/_next/static/chunks/9907-5506ff589fd39303.js', revision: '5506ff589fd39303' },
				{
					url: '/_next/static/chunks/app/(dashboard)/categories/page-174d815f178256e4.js',
					revision: '174d815f178256e4',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/dashboard/page-9522ba1bf9a74bce.js',
					revision: '9522ba1bf9a74bce',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/layout-86b09c58b5bb9c71.js',
					revision: '86b09c58b5bb9c71',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/reports/page-e753b2d819d9acda.js',
					revision: 'e753b2d819d9acda',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/settings/page-6f2be0833e49c9a7.js',
					revision: '6f2be0833e49c9a7',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/transactions/page-c5eef14e2c15c654.js',
					revision: 'c5eef14e2c15c654',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/wallets/page-984b5516dd506772.js',
					revision: '984b5516dd506772',
				},
				{
					url: '/_next/static/chunks/app/_global-error/page-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/_not-found/page-c51fe48f89c575df.js',
					revision: 'c51fe48f89c575df',
				},
				{
					url: '/_next/static/chunks/app/api/auth/google/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/auth/login/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/auth/logout/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/auth/me/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/auth/register/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/categories/%5Bid%5D/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/categories/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/exchange-rates/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/health/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/reports/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/summary/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/transactions/%5Bid%5D/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/transactions/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/user/password/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/user/profile/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/user/upload-image/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/wallets/%5Bid%5D/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/wallets/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/api/weather/route-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/app/layout-6796ba017a8e36f0.js',
					revision: '6796ba017a8e36f0',
				},
				{
					url: '/_next/static/chunks/app/login/page-76d4605774f924c0.js',
					revision: '76d4605774f924c0',
				},
				{ url: '/_next/static/chunks/app/page-6c8e4fbca0b5c328.js', revision: '6c8e4fbca0b5c328' },
				{
					url: '/_next/static/chunks/app/register/page-1734b4f4eddb78e3.js',
					revision: '1734b4f4eddb78e3',
				},
				{ url: '/_next/static/chunks/framework-711ef29bc66f648c.js', revision: '711ef29bc66f648c' },
				{ url: '/_next/static/chunks/main-39eb0ddb5fcc6b33.js', revision: '39eb0ddb5fcc6b33' },
				{ url: '/_next/static/chunks/main-app-fb320f9715c5b4a1.js', revision: 'fb320f9715c5b4a1' },
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-2c5183fa5222ab83.js',
					revision: '2c5183fa5222ab83',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-4e04f15fa5ba881a.js',
					revision: '4e04f15fa5ba881a',
				},
				{
					url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
					revision: '846118c33b2c0e922d7b3a7676f81f6f',
				},
				{ url: '/_next/static/chunks/webpack-94f07feefa2f20f6.js', revision: '94f07feefa2f20f6' },
				{ url: '/_next/static/css/85d0ed530c7fc2bc.css', revision: '85d0ed530c7fc2bc' },
				{ url: '/_next/static/css/8c3724dacf75214d.css', revision: '8c3724dacf75214d' },
				{ url: '/_next/static/css/9b6b1dd9dcfdd0ef.css', revision: '9b6b1dd9dcfdd0ef' },
				{
					url: '/_next/static/media/01f0c602c274ea55-s.p.woff2',
					revision: 'cec73543deed2c5a2aad442c82408919',
				},
				{
					url: '/_next/static/media/350b852752f8489d-s.p.woff2',
					revision: '8189abd2eb7f5085239289d0dd04da02',
				},
				{
					url: '/_next/static/media/5ec84f17416dda4d-s.woff2',
					revision: '9dfa03ce2ef5bc3aa9f0f8a5b3e7a0ba',
				},
				{ url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
				{ url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
				{ url: '/icons/apple-touch-icon.png', revision: '116118b5e1dce89de5aa44e0a37561b5' },
				{ url: '/icons/icon-192.png', revision: '116118b5e1dce89de5aa44e0a37561b5' },
				{ url: '/icons/icon-512.png', revision: '372acf5dd4ac3a5fd629ec7c53da5055' },
				{ url: '/icons/maskable-icon-192.png', revision: '116118b5e1dce89de5aa44e0a37561b5' },
				{ url: '/icons/maskable-icon-512.png', revision: '372acf5dd4ac3a5fd629ec7c53da5055' },
				{ url: '/images/avatar.png', revision: 'd8a10296d84d043a896665ee14d69852' },
				{ url: '/manifest.json', revision: '507f3184cfbbc0072d7649585fe9b9ed' },
				{ url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
				{ url: '/uploads/3-1776670905562.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/uploads/3-1776670931230.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/uploads/3-1776680795491.png', revision: '307891a7199e746bd8eca9c0b54ac25a' },
				{ url: '/uploads/5-1776671371753.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
				{ url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
			],
			{ ignoreURLParametersMatching: [] }
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			'/',
			new e.NetworkFirst({
				cacheName: 'start-url',
				plugins: [
					{
						cacheWillUpdate: async ({ request: e, response: a, event: s, state: i }) =>
							a && 'opaqueredirect' === a.type
								? new Response(a.body, { status: 200, statusText: 'OK', headers: a.headers })
								: a,
					},
				],
			}),
			'GET'
		),
		e.registerRoute(
			/^https?:\/\/[^/]+(\/|(\/dashboard|\/exchange|\/weather))?$/,
			new e.NetworkFirst({
				cacheName: 'pages-cache',
				plugins: [new e.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 86400 })],
			}),
			'GET'
		),
		e.registerRoute(
			/^https?:\/\/.*(exchangerate|currency|fixer).*\/.*$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'exchange-rates',
				plugins: [new e.ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 21600 })],
			}),
			'GET'
		),
		e.registerRoute(
			/^https?:\/\/.*(openweathermap|weather).*\/.*$/i,
			new e.NetworkFirst({
				cacheName: 'weather-cache',
				plugins: [new e.ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 3600 })],
			}),
			'GET'
		),
		e.registerRoute(
			/^\/api\/.*$/,
			new e.NetworkFirst({
				cacheName: 'api-cache',
				plugins: [new e.ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 300 })],
			}),
			'GET'
		),
		e.registerRoute(
			/\.(woff2|woff|ttf|eot|png|jpg|jpeg|svg|ico)$/,
			new e.CacheFirst({
				cacheName: 'assets-cache',
				plugins: [new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592e3 })],
			}),
			'GET'
		));
});
