export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="border-b border-neutral-200 bg-white px-8 py-6 flex items-end justify-between" data-testid="page-header">
      <div>
        <p className="text-xs uppercase text-neutral-500">{subtitle}</p>
        <h1 className="font-black text-3xl tracking-tight mt-1">{title}</h1>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}