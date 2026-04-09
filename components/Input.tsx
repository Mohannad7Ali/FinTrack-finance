// Input Component
function Input({
	label,
	value,
	onChange,
	type = 'text',
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	type?: string;
}) {
	return (
		<div className="space-y-2">
			<label className="text-xs text-slate-200">{label}</label>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
			/>
		</div>
	);
}
export default Input;
