import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent, lines } from '@/hooks/useSiteContent';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function HeroSection() {
  const c = useSiteContent();
  const { data: settings } = useSiteSettings();
  const phone = settings?.contact_phone ?? '+1 (800) 123-4567';
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`;
  const bg = c.hero_image_url.trim();

  return (
    <section className="relative overflow-hidden bg-foreground min-h-[600px] md:min-h-[680px] lg:min-h-[720px] flex items-center">
      <div className="absolute inset-0">
        <picture>
          {!bg && <source media="(max-width: 767px)" srcSet="/hero/bg-mobile.webp" type="image/webp" />}
          {!bg && <source srcSet="/hero/bg.webp" type="image/webp" />}
          <img
            src={bg || '/hero/bg.webp'}
            alt={`${c.brand_name} banker with a customer`}
            width={1376}
            height={768}
            fetchPriority="high"
            decoding="async"
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover object-[45%_center] sm:object-center animate-[heroZoom_20s_ease-in-out_infinite_alternate] brightness-110 contrast-110"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent md:from-foreground/50 md:via-foreground/10 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-foreground/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6 animate-fade-in border border-primary-foreground/10 shadow-2xl">
            {c.hero_chip && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-medium">
                <Shield className="w-4 h-4 text-success" />
                {c.hero_chip}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight">
              {c.hero_title}{' '}
              <span className="text-accent">{c.hero_title_highlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-primary-foreground/85 max-w-lg leading-relaxed">{c.hero_subtitle}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lines(c.hero_benefits).map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-primary-foreground/90 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg group" asChild>
                <Link to="/register">
                  {c.hero_cta_primary}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/15 font-semibold text-base px-8" asChild>
                <Link to="/login">{c.hero_cta_secondary}</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm pt-2">
              <Phone className="w-4 h-4" />
              <span>Questions? Call us: <a href={telHref} className="underline hover:text-primary-foreground transition-colors">{phone}</a></span>
            </div>
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
