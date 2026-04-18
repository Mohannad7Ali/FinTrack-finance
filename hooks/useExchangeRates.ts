'use client';
import { CurrencyCode, ExchangeData } from '@/types/finance';
import useSWR from 'swr';
import { useCallback } from 'react';

const REFRESH_INTERVAL = 60000;

const fetcher = async (): Promise<ExchangeData> => {
	try {
		const fiatRes = await fetch('https://api.budjet.org/fiat/USD');
		const fiatData = await fiatRes.json();

		let rates = {};
		if (fiatData?.conversion_rates) {
			rates = fiatData.conversion_rates;
			console.log('✅ Fiat rates loaded:', Object.keys(rates).slice(0, 5));
		} else if (fiatData?.rates) {
			rates = fiatData.rates;
		} else {
			console.warn('❌ Fiat API response unexpected:', fiatData);
		}

		return {
			rates,
			goldPrice: 0, // لا نستخدمه، لكن للحفاظ على التوافق مع الـ type
			timestamp: Date.now(),
		};
	} catch (err) {
		console.warn('Fetcher error:', err);
		return { rates: {}, goldPrice: 0, timestamp: Date.now() };
	}
};

export function useExchangeRates() {
	const { data, error, isLoading, mutate } = useSWR<ExchangeData>('exchange-rates', fetcher, {
		refreshInterval: REFRESH_INTERVAL,
		revalidateOnFocus: true,
		shouldRetryOnError: true,
		dedupingInterval: 5000,
	});

	const convert = useCallback(
		(amount: number, from: CurrencyCode = 'USD', to: CurrencyCode = 'SYP'): number => {
			// إزالة دعم GOLD بالكامل
			if (!data?.rates || Object.keys(data.rates).length === 0 || !amount) return 0;

			try {
				let amountInUSD: number;

				if (from === 'USD') {
					amountInUSD = amount;
				} else {
					const rateToUSD = data.rates[from];
					if (!rateToUSD) return 0;
					amountInUSD = amount / rateToUSD;
				}

				if (to === 'SYP') {
					const sypRate = data.rates['SYP'];
					if (!sypRate) return 0;
					return amountInUSD * sypRate;
				} else {
					const targetRate = data.rates[to];
					return targetRate ? amountInUSD * targetRate : 0;
				}
			} catch (err) {
				console.warn('Conversion error:', err);
				return 0;
			}
		},
		[data]
	);

	return {
		convert,
		rates: data?.rates,
		goldPrice: data?.goldPrice, // سيظل 0 دائماً
		isLoading,
		isError: !!error,
		refresh: () => mutate(),
	};
}
