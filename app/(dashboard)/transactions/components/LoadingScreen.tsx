export function LoadingScreen() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-3">
			<div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
			<p className="text-slate-300 text-sm">جاري تحميل المعاملات...</p>
		</div>
	);
}
