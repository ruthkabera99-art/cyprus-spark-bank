import { useSiteContent, lines } from '@/hooks/useSiteContent';

export function StatsSection() {
  const content = useSiteContent();
  const stats = lines(content.stats).map((l) => {
    const [value, ...rest] = l.split('|');
    return { value: value.trim(), label: rest.join('|').trim() };
  });
  if (stats.length === 0) return null;

  return (
    <section className="py-16 gradient-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={`${stat.value}-${index}`}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <p className="text-4xl md:text-5xl font-serif font-bold text-primary-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-primary-foreground/80 text-sm md:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
