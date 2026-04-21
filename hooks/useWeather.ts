// hooks/useWeather.ts
import useSWR from 'swr';
import { useEffect, useReducer, useRef } from 'react';

export type WeatherData = {
	temp: number;
	condition: string;
	conditionIcon: string;
	location: string;
	coordinates?: { lat: number; lon: number };
	lastUpdated: Date;
};

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

async function fetcher(url: string): Promise<WeatherData> {
	const res = await fetch(url);
	if (!res.ok) {
		const error = await res.json();
		throw new Error(error.error || `HTTP ${res.status}`);
	}
	const data = await res.json();
	return {
		...data,
		lastUpdated: new Date(data.lastUpdated),
	};
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
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
		);

		return () => {
			isMounted.current = false;
		};
	}, []);

	const swrKey =
		locationState.status === 'success' && locationState.coordinates
			? `/api/weather?lat=${locationState.coordinates.lat}&lon=${locationState.coordinates.lon}`
			: null;

	const { data, error, isValidating, mutate } = useSWR<WeatherData>(swrKey, fetcher, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
		refreshInterval: 30 * 60 * 1000, // 30 minutes
		shouldRetryOnError: true,
		errorRetryCount: 2,
		errorRetryInterval: 5000,
		fallbackData: undefined,
	});

	return {
		weather: data ?? null,
		isLoading:
			locationState.status === 'loading' || (locationState.status === 'success' && isValidating),
		isLocating: locationState.status === 'loading',
		error:
			locationState.status === 'error' ? locationState.errorMessage : error ? error.message : null,
		refetch: () => mutate(),
		coordinates: locationState.coordinates ?? null,
	};
}
