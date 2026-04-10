'use client';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { SummaryResponse } from '@/types/summary';
export function useSummary(month: number, year: number) {
	const { data, error, isLoading, mutate } = useSWR<SummaryResponse>(
		`api/summary?month=${month}&year=${year}`,
		fetcher,
		{ revalidateOnFocus: true, dedupingInterval: 5000 }
	);
	return {
		data,
		error: error?.message,
		isLoading,
		refresh: mutate,
	};
}
