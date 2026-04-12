type SummaryCardProps = {
	title: string;
	value: number;
	color: 'emerald' | 'red';
	description?: string;
};

const SummaryCard = ({ title, value = 0, color, description }: SummaryCardProps) => {
	const colorClass = color === 'emerald' ? 'text-emerald-500' : 'text-red-500';
	return (
		<div className="relative groub overflow-hidden border border-white/10 bg-white/5 backdrob-blur-xl p-4 space-y-1 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-400/70 ">
			<h2 className="text-sm font-medium text-slate-200">{title}</h2>
			<p className={`text-2xl font-bold ${colorClass}`}>R$ {value.toFixed(2)}</p>
			<p className="text-slate-400 text-[11px]">{description}</p>
		</div>
	);
};

export default SummaryCard;
