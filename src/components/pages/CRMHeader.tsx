interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function CRMHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="flex mb-7 items-center justify-between">
      <h3 className="text-3xl font-bold">{title}</h3>
      {actions && <div className="flex gap-5">{actions}</div>}
    </header>
  );
}
