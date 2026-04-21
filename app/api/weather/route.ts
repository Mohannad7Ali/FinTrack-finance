// app/api/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';

const METEO_API_KEY = process.env.METEO_SOURCE_API_KEY;
const BASE_URL = 'https://www.meteosource.com/api/v1/free';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchMeteo(endpoint: string, params: URLSearchParams) {
	params.set('key', METEO_API_KEY!);
	const url = `${BASE_URL}${endpoint}?${params.toString()}`;
	const res = await fetch(url);
	if (!res.ok) {
		const error = await res.json().catch(() => ({}));
		throw new Error(error.detail || `HTTP ${res.status}`);
	}
	return res.json();
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const lat = searchParams.get('lat');
		const lon = searchParams.get('lon');

		if (!lat || !lon) {
			return NextResponse.json({ error: 'Missing lat/lon' }, { status: 400 });
		}

		// Normalize coordinates (ensure they are numbers, not strings like "33.49N")
		const latNum = parseFloat(lat);
		const lonNum = parseFloat(lon);
		if (isNaN(latNum) || isNaN(lonNum)) {
			return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
		}

		const cacheKey = `${latNum},${lonNum}`;
		const now = Date.now();
		const cached = cache.get(cacheKey);
		if (cached && now - cached.timestamp < CACHE_TTL) {
			return NextResponse.json(cached.data);
		}

		// Step 1: Get nearest place (gives us place_id and location details)
		const nearestParams = new URLSearchParams({
			lat: latNum.toString(),
			lon: lonNum.toString(),
			language: 'en',
		});
		const nearest = await fetchMeteo('/nearest_place', nearestParams);

		// Build a professional location name
		let locationName = nearest.name;
		if (nearest.adm_area1 && nearest.adm_area1 !== nearest.name) {
			locationName = `${nearest.name}, ${nearest.adm_area1}`;
		}
		if (nearest.country && !locationName.includes(nearest.country)) {
			locationName = `${locationName}, ${nearest.country}`;
		}
		// If name is still too obscure or missing, fallback to admin area
		if (!locationName || locationName.trim() === '') {
			locationName = nearest.adm_area1 || nearest.country || 'موقعك';
		}

		// Step 2: Get weather data for that place_id
		const weatherParams = new URLSearchParams({
			place_id: nearest.place_id,
			sections: 'current',
			language: 'en',
			units: 'metric',
			timezone: 'auto',
		});
		const weather = await fetchMeteo('/point', weatherParams);

		const current = weather.current;
		if (!current) {
			throw new Error('No current weather data');
		}

		// Map icon number to Arabic condition and emoji
		const iconMap: Record<number, { icon: string; conditionAr: string }> = {
			0: { icon: '☀️', conditionAr: 'صافي' },
			1: { icon: '⛅', conditionAr: 'غائم جزئياً' },
			2: { icon: '☁️', conditionAr: 'غائم' },
			3: { icon: '☁️', conditionAr: 'غائم جداً' },
			4: { icon: '🌫️', conditionAr: 'ضباب' },
			5: { icon: '🌦️', conditionAr: 'مطر خفيف' },
			6: { icon: '🌧️', conditionAr: 'مطر' },
			7: { icon: '⛈️', conditionAr: 'عاصفة رعدية' },
			8: { icon: '🌨️', conditionAr: 'ثلوج' },
			9: { icon: '🌨️', conditionAr: 'تساقط ثلوج' },
			10: { icon: '💨', conditionAr: 'رياح قوية' },
		};
		const iconNum = current.icon_num ?? 0;
		const mapped = iconMap[iconNum] || { icon: '🌡️', conditionAr: 'متقلب' };

		const result = {
			temp: Math.round(current.temperature),
			condition: mapped.conditionAr,
			conditionIcon: mapped.icon,
			location: locationName,
			coordinates: { lat: latNum, lon: lonNum },
			lastUpdated: new Date().toISOString(),
		};

		// Cache
		cache.set(cacheKey, { data: result, timestamp: now });

		return NextResponse.json(result);
	} catch (error: any) {
		console.error('Weather API error:', error);
		// Return stale cache if available
		const lat = new URL(req.url).searchParams.get('lat');
		const lon = new URL(req.url).searchParams.get('lon');
		if (lat && lon) {
			const cached = cache.get(`${parseFloat(lat)},${parseFloat(lon)}`);
			if (cached) {
				return NextResponse.json({ ...cached.data, fromCache: true });
			}
		}
		return NextResponse.json(
			{ error: error.message || 'Failed to fetch weather' },
			{ status: 500 }
		);
	}
}
