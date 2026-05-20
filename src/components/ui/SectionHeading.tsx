export function SectionHeading({
  eyebrow,
  title,
  align = 'center',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center';
  return (
    <div className={`${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-widest text-sage-600">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-serif text-4xl font-light text-forest-dark">
        {title}
      </h2>
    </div>
  );
}
