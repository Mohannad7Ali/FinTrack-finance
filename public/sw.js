if (!self.define) {
	let a,
		e = {};
	const s = (s, c) => (
		(s = new URL(s + '.js', c).href),
		e[s] ||
			new Promise((e) => {
				if ('document' in self) {
					const a = document.createElement('script');
					((a.src = s), (a.onload = e), document.head.appendChild(a));
				} else ((a = s), importScripts(s), e());
			}).then(() => {
				let a = e[s];
				if (!a) throw new Error(`Module ${s} didn’t register its module`);
				return a;
			})
	);
	self.define = (c, i) => {
		const t = a || ('document' in self ? document.currentScript.src : '') || location.href;
		if (e[t]) return;
		let n = {};
		const r = (a) => s(a, t),
			f = { module: { uri: t }, exports: n, require: r };
		e[t] = Promise.all(c.map((a) => f[a] || r(a))).then((a) => (i(...a), n));
	};
}
define(['./workbox-86a8e45e'], function (a) {
	'use strict';
	(importScripts(),
		self.skipWaiting(),
		a.clientsClaim(),
		a.precacheAndRoute(
			[
				{
					url: '/_next/static/WRmPm2yOPeSqkQTQzG-hp/_buildManifest.js',
					revision: '6588b6fead5ecce5942845c63629367b',
				},
				{
					url: '/_next/static/WRmPm2yOPeSqkQTQzG-hp/_ssgManifest.js',
					revision: 'b6652df95db52feb4daf4eca35380933',
				},
				{ url: '/_next/static/chunks/1589-4f7cc071b88f5e0f.js', revision: '4f7cc071b88f5e0f' },
				{ url: '/_next/static/chunks/1677-8400183ce28c554e.js', revision: '8400183ce28c554e' },
				{ url: '/_next/static/chunks/1966.b8f83f7ba376c962.js', revision: 'b8f83f7ba376c962' },
				{ url: '/_next/static/chunks/2970-994c090f2c72a7bf.js', revision: '994c090f2c72a7bf' },
				{ url: '/_next/static/chunks/3598-7d0aa1e0daba9c41.js', revision: '7d0aa1e0daba9c41' },
				{ url: '/_next/static/chunks/3617-c0a0997b623f833e.js', revision: 'c0a0997b623f833e' },
				{ url: '/_next/static/chunks/3794-154456079185e990.js', revision: '154456079185e990' },
				{ url: '/_next/static/chunks/3810-87b2ea1ca37bae35.js', revision: '87b2ea1ca37bae35' },
				{ url: '/_next/static/chunks/3899.3f761f7e3a944e8c.js', revision: '3f761f7e3a944e8c' },
				{ url: '/_next/static/chunks/4527-e00bbb09a2bb5f47.js', revision: 'e00bbb09a2bb5f47' },
				{ url: '/_next/static/chunks/4855-01493513a4a5953f.js', revision: '01493513a4a5953f' },
				{ url: '/_next/static/chunks/4bd1b696-e356ca5ba0218e27.js', revision: 'e356ca5ba0218e27' },
				{ url: '/_next/static/chunks/5772-2d538cc4a7c2ac4a.js', revision: '2d538cc4a7c2ac4a' },
				{ url: '/_next/static/chunks/5859-ff30b422af7f3add.js', revision: 'ff30b422af7f3add' },
				{ url: '/_next/static/chunks/5979-cc42ad5262c664ba.js', revision: 'cc42ad5262c664ba' },
				{ url: '/_next/static/chunks/6124-1fceac9dab2282ec.js', revision: '1fceac9dab2282ec' },
				{ url: '/_next/static/chunks/6443-fa3bc2bc827f7ff4.js', revision: 'fa3bc2bc827f7ff4' },
				{ url: '/_next/static/chunks/6835-358684754dea59c4.js', revision: '358684754dea59c4' },
				{ url: '/_next/static/chunks/8285-32e53fd0d1131033.js', revision: '32e53fd0d1131033' },
				{ url: '/_next/static/chunks/8500-f62a38ff68ab7f42.js', revision: 'f62a38ff68ab7f42' },
				{ url: '/_next/static/chunks/8687-dccd0115817548a7.js', revision: 'dccd0115817548a7' },
				{ url: '/_next/static/chunks/9448-f57e9994795e03a1.js', revision: 'f57e9994795e03a1' },
				{ url: '/_next/static/chunks/9723-3195d042b5af5759.js', revision: '3195d042b5af5759' },
				{
					url: '/_next/static/chunks/app/(dashboard)/categories/page-cf04ed805111057e.js',
					revision: 'cf04ed805111057e',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/dashboard/page-04a88d34ad236ca8.js',
					revision: '04a88d34ad236ca8',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/layout-4d4953db6bca4a07.js',
					revision: '4d4953db6bca4a07',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/reports/page-a684d282ba2ed6d9.js',
					revision: 'a684d282ba2ed6d9',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/settings/page-7af99dff323642bb.js',
					revision: '7af99dff323642bb',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/transactions/page-7882cbc848e60d65.js',
					revision: '7882cbc848e60d65',
				},
				{
					url: '/_next/static/chunks/app/(dashboard)/wallets/page-e98a22df480a7174.js',
					revision: 'e98a22df480a7174',
				},
				{
					url: '/_next/static/chunks/app/_global-error/page-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/_not-found/page-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/ai/financial-analysis/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/auth/google/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/auth/login/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/auth/logout/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/auth/me/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/auth/register/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/categories/%5Bid%5D/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/categories/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/exchange-rates/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/health/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/reports/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/summary/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/transactions/%5Bid%5D/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/transactions/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/user/password/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/user/profile/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/user/upload-image/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/wallets/%5Bid%5D/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/wallets/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/wallets/total/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/api/weather/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/layout-1b9bbd674218ed51.js',
					revision: '1b9bbd674218ed51',
				},
				{
					url: '/_next/static/chunks/app/loading-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/app/login/page-23f4dfaef042ff03.js',
					revision: '23f4dfaef042ff03',
				},
				{
					url: '/_next/static/chunks/app/maintenance/page-daa27858ae486a37.js',
					revision: 'daa27858ae486a37',
				},
				{
					url: '/_next/static/chunks/app/not-found-68337055beac3fd7.js',
					revision: '68337055beac3fd7',
				},
				{ url: '/_next/static/chunks/app/page-f4e0fc403df20083.js', revision: 'f4e0fc403df20083' },
				{
					url: '/_next/static/chunks/app/recovery/page-ece407e28357d255.js',
					revision: 'ece407e28357d255',
				},
				{
					url: '/_next/static/chunks/app/register/page-eaf5700e570a47f8.js',
					revision: 'eaf5700e570a47f8',
				},
				{
					url: '/_next/static/chunks/app/sitemap.xml/route-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{ url: '/_next/static/chunks/framework-711ef29bc66f648c.js', revision: '711ef29bc66f648c' },
				{ url: '/_next/static/chunks/main-39eb0ddb5fcc6b33.js', revision: '39eb0ddb5fcc6b33' },
				{ url: '/_next/static/chunks/main-app-a598e872cc85125b.js', revision: 'a598e872cc85125b' },
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-520cb807c9b39ce0.js',
					revision: '520cb807c9b39ce0',
				},
				{
					url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-a8175705d39c2a1f.js',
					revision: 'a8175705d39c2a1f',
				},
				{
					url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
					revision: '846118c33b2c0e922d7b3a7676f81f6f',
				},
				{ url: '/_next/static/chunks/webpack-851421286d9fcf52.js', revision: '851421286d9fcf52' },
				{ url: '/_next/static/css/8c3724dacf75214d.css', revision: '8c3724dacf75214d' },
				{ url: '/_next/static/css/ab404b1a851660e6.css', revision: 'ab404b1a851660e6' },
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
				{ url: '/icons/apple-touch-icon.png', revision: '84ada0c16169da9a3aacaebcd1fc1f11' },
				{ url: '/icons/icon-192.png', revision: '84ada0c16169da9a3aacaebcd1fc1f11' },
				{ url: '/icons/icon-512.png', revision: 'fd3915c3d18aa737e61f9405f125a5cb' },
				{ url: '/icons/maskable-icon-192.png', revision: '84ada0c16169da9a3aacaebcd1fc1f11' },
				{ url: '/icons/maskable-icon-512.png', revision: 'fd3915c3d18aa737e61f9405f125a5cb' },
				{ url: '/images/avatar.png', revision: 'd8a10296d84d043a896665ee14d69852' },
				{ url: '/manifest.json', revision: '507f3184cfbbc0072d7649585fe9b9ed' },
				{ url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
				{ url: '/robots.txt', revision: 'c801a9e468716da46eb6929d1f20bf82' },
				{ url: '/uploads/3-1776670905562.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/uploads/3-1776670931230.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/uploads/3-1776680795491.png', revision: '307891a7199e746bd8eca9c0b54ac25a' },
				{ url: '/uploads/5-1776671371753.jpg', revision: '1202e87180fa7c5b8faa58b80062aeba' },
				{ url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
				{ url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
			],
			{ ignoreURLParametersMatching: [] }
		),
		a.cleanupOutdatedCaches(),
		a.registerRoute(
			'/',
			new a.NetworkFirst({
				cacheName: 'start-url',
				plugins: [
					{
						cacheWillUpdate: async ({ request: a, response: e, event: s, state: c }) =>
							e && 'opaqueredirect' === e.type
								? new Response(e.body, { status: 200, statusText: 'OK', headers: e.headers })
								: e,
					},
				],
			}),
			'GET'
		));
});
