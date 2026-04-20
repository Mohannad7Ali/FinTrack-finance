import useSWR from 'swr';
import { useEffect, useReducer, useRef } from 'react';
import { weatherCodeMap } from '@/lib/constants/date.constant';

// أنواع البيانات
export type WeatherCondition = {
	ar: string;
	icon: string;
};

export type WeatherData = {
	temp: number;
	condition: string;
	conditionIcon: string;
	location: string;
	coordinates?: { lat: number; lon: number };
	lastUpdated: Date;
};

// دالة جلب الطقس مع حماية ضد الأخطاء
async function fetchWeatherFromAPI(lat: number, lon: number): Promise<WeatherData | null> {
	try {
		const weatherRes = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
		);
		if (!weatherRes.ok) throw new Error(`HTTP ${weatherRes.status}`);
		const weatherData = await weatherRes.json();
		const temp = Math.round(weatherData.current_weather.temperature);
		const weatherCode = weatherData.current_weather.weathercode;
		const conditionInfo = weatherCodeMap[weatherCode] || { ar: 'متقلب', icon: '🌡️' };

		let locationName = 'موقعك';
		try {
			const geoRes = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
			);
			if (geoRes.ok) {
				const geoData = await geoRes.json();
				locationName =
					geoData.address?.state ||
					geoData.address?.country ||
					geoData.address?.country_code ||
					'موقعك';
			}
		} catch (geoError) {
			console.warn('فشل جلب اسم الموقع:', geoError);
		}

		return {
			temp,
			condition: conditionInfo.ar,
			conditionIcon: conditionInfo.icon,
			location: locationName,
			coordinates: { lat, lon },
			lastUpdated: new Date(),
		};
	} catch (error) {
		console.warn('خطأ في جلب الطقس:', error);
		return null; // لا نرمي خطأ، نرجع null فقط
	}
}

// حالة تحديد الموقع
type LocationState = {
	status: 'idle' | 'loading' | 'success' | 'error';
	coordinates?: { lat: number; lon: number };
	errorMessage?: string;
};

type LocationAction =
	| { type: 'START_LOCATING' }
	| { type: 'LOCATION_SUCCESS'; payload: { lat: number; lon: number } }
	| { type: 'LOCATION_ERROR'; payload: string };

function locationReducer(state: LocationState, action: LocationAction): LocationState {
	switch (action.type) {
		case 'START_LOCATING':
			return { status: 'loading' };
		case 'LOCATION_SUCCESS':
			return { status: 'success', coordinates: action.payload };
		case 'LOCATION_ERROR':
			return { status: 'error', errorMessage: action.payload };
		default:
			return state;
	}
}

export function useWeather() {
	const [locationState, dispatch] = useReducer(locationReducer, { status: 'idle' });
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		if (!navigator.geolocation) {
			dispatch({ type: 'LOCATION_ERROR', payload: 'المتصفح لا يدعم تحديد الموقع الجغرافي' });
			return;
		}

		dispatch({ type: 'START_LOCATING' });

		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (isMounted.current) {
					dispatch({
						type: 'LOCATION_SUCCESS',
						payload: {
							lat: position.coords.latitude,
							lon: position.coords.longitude,
						},
					});
				}
			},
			(error) => {
				if (!isMounted.current) return;
				let message = 'فشل تحديد الموقع';
				switch (error.code) {
					case error.PERMISSION_DENIED:
						message = 'الرجاء السماح بالوصول إلى الموقع لعرض حالة الطقس';
						break;
					case error.POSITION_UNAVAILABLE:
						message = 'معلومات الموقع غير متوفرة حالياً';
						break;
					case error.TIMEOUT:
						message = 'انتهى وقت محاولة تحديد الموقع';
						break;
				}
				dispatch({ type: 'LOCATION_ERROR', payload: message });
			}
		);

		return () => {
			isMounted.current = false;
		};
	}, []);

	// بناء مفتاح SWR آمن - إذا لم تكن الإحداثيات موجودة، المفتاح null
	const swrKey =
		locationState.status === 'success' &&
		locationState.coordinates?.lat &&
		locationState.coordinates?.lon
			? ['weather', locationState.coordinates.lat, locationState.coordinates.lon]
			: null;

	// دالة الجالب: لن تُستدعى إلا إذا كان المفتاح غير null
	const fetcher = async ([, lat, lon]: [string, number, number]) => {
		return await fetchWeatherFromAPI(lat, lon);
	};

	const { data, error, isValidating, mutate } = useSWR(swrKey, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
		refreshInterval: 30 * 60 * 1000, // 30 دقيقة
		shouldRetryOnError: true,
		errorRetryCount: 2,
		errorRetryInterval: 5000,
		fallbackData: null, // تجنب undefined
	});

	// قيمة آمنة للـ weather: دائماً كائن أو null، وليس undefined
	const safeWeather = data ?? null;

	return {
		weather: safeWeather,
		isLoading:
			locationState.status === 'loading' || (locationState.status === 'success' && isValidating),
		isLocating: locationState.status === 'loading',
		error:
			locationState.status === 'error' ? locationState.errorMessage : error ? error.message : null,
		refetch: () => mutate(),
		coordinates: locationState.coordinates ?? null,
	};
}
