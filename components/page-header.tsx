interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-4xl">{icon}</span>}
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
      </div>
      {description && (
        <p className="text-neutral-600 text-lg">{description}</p>
      )}
    </div>
  );
}
