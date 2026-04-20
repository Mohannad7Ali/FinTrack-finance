export function ErrorScreen({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-2 text-red-400">
			<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p>فشل تحميل المعاملات: {message}</p>
		</div>
	);
}
