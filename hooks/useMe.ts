'use client';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
export type MeResponse =
	| {
			ok: true;
			userId?: number | null;
			name?: string;
			email?: string;
			authenticated?: boolean;
			image?: string | null;
			preferredCurrency?: string;
	  }
	| { ok: false; error?: string; authenticated?: boolean };
export function useME() {
	const { data, error, isLoading, mutate } = useSWR<MeResponse>(`api/auth/me`, fetcher, {
		revalidateOnFocus: true,
		dedupingInterval: 5000,
	});
	if (data?.ok) {
		return {
			data,
			error: error?.message,
			isLoading,
			refresh: mutate,
		};
	}
	return {
		data: {
			ok: false,
			userId: null,
			name: '',
			email: null,
			image: null,
			preferredCurrency: 'SYP',
			authenticated: false,
		},
		error: error?.message,
		isLoading,
		refresh: mutate,
	};
}
