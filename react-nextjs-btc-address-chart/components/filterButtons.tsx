const filters = ['ALL', 'YTD', '12M', '3M', '1M'];

export default function FilterButtons({
    filter,
    onChange,
}: {
    filter: string,
    onChange: Function,
}) {
    const btnStyle = 'rounded-sm bold py-0.5 px-2 text-xs ';
    const getButtonStyle = (f: string) =>
        btnStyle + (f === filter 
            ? 'bg-[#9900ff] text-white'
            : 'bg-[#d3d3d3]');

    return <div className="flex justify-end gap-2">
        {filters.map((f) => <div
            className={getButtonStyle(f)}
            key={f}
            onClick={() => f === filter ? null : onChange(f)}
        >
            {f}
        </div>)}
    </div>
}
