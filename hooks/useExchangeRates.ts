// hooks/useExchangeRates.ts
'use client';
import { CurrencyCode, ExchangeData } from '@/types/finance';
import useSWR from 'swr';
import { useCallback } from 'react';

// تحديث كل 6 ساعات (لتتناسب مع الـ API الوسيط)
const REFRESH_INTERVAL = 3 * 60 * 60 * 1000;

const fetcher = async (): Promise<ExchangeData> => {
	const res = await fetch('/api/exchange-rates');
	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
	const data = await res.json();
	if (data && data.rates) {
		return { rates: data.rates, goldPrice: 0, timestamp: Date.now() };
	}
	return { rates: {}, goldPrice: 0, timestamp: Date.now() };
};

export function useExchangeRates() {
	const { data, error, isLoading, mutate } = useSWR<ExchangeData>(
		'exchange-rates-syria-api',
		fetcher,
		{
			refreshInterval: REFRESH_INTERVAL,
			revalidateOnFocus: false, // لا نطلب عند التركيز لتوفير الطلبات
			revalidateOnReconnect: false,
			shouldRetryOnError: true,
			dedupingInterval: 60000,
		}
	);

	const convert = useCallback(
		(amount: number, from: CurrencyCode = 'USD', to: CurrencyCode = 'SYP'): number => {
			if (!amount) return 0;
			if (!data?.rates || Object.keys(data.rates).length === 0) return 0;

			try {
				let amountInUSD: number;
				if (from === 'USD') {
					amountInUSD = amount;
				} else {
					const rateToUSD = data.rates[from];
					if (!rateToUSD) return 0;
					amountInUSD = amount / rateToUSD;
				}
				if (to === 'USD') return amountInUSD;
				const targetRate = data.rates[to];
				return targetRate ? amountInUSD * targetRate : 0;
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
		goldPrice: data?.goldPrice,
		isLoading,
		isError: !!error,
		refresh: () => mutate(),
	};
}
