// hooks/useReports.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ReportsResponse } from '@/types/reports';

export function useReports(month: number, year: number) {
	const { data, error, isLoading, mutate } = useSWR<ReportsResponse>(
		`/api/reports?month=${month}&year=${year}`,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
			dedupingInterval: 60000, // 1 minute
		}
	);
	console.log('SWR data received in hook:', data);

	return {
		data,
		isLoading,
		error: error?.message || data?.error,
		refresh: mutate,
	};
}
