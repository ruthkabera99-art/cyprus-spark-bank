import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Small Business Owner',
    location: 'Austin, TX',
    text: 'MorganFinance has been instrumental in growing my business. Their collateral loan process was transparent, and I always knew exactly where I stood. The team genuinely cares about their clients.',
    rating: 5,
    years: 'Customer since 2018',
    avatar: 'https://i.pravatar.cc/160?img=47',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    location: 'San Francisco, CA',
    text: 'I switched to MorganFinance for the security features and stayed for the service. The 24/7 support team resolved my issue within minutes. My deposits are FDIC insured, which gives me real peace of mind.',
    rating: 5,
    years: 'Customer since 2020',
    avatar: 'https://i.pravatar.cc/160?img=12',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Freelance Consultant',
    location: 'Miami, FL',
    text: 'As a freelancer, I need a bank that makes transfers fast and fees fair. MorganFinance delivers on both. Their mobile experience is the best I\'ve used, and I appreciate the clear fee disclosures.',
    rating: 5,
    years: 'Customer since 2021',
    avatar: 'https://i.pravatar.cc/160?img=45',
  },
  {
    name: "James O'Connor",
    role: 'Real Estate Investor',
    location: 'Chicago, IL',
    text: "I've financed three property deals through MorganFinance. Their collateral-backed loans are competitively priced and funded faster than any traditional lender I've worked with. Truly a partner in growth.",
    rating: 5,
    years: 'Customer since 2019',
    avatar: 'https://i.pravatar.cc/160?img=33',
  },
  {
    name: 'Priya Patel',
    role: 'Doctor & Investor',
    location: 'Boston, MA',
    text: 'The wealth management tools and crypto custody at MorganFinance are unmatched. I can see my entire net worth in one dashboard, and the advisors actually listen before recommending anything.',
    rating: 5,
    years: 'Customer since 2022',
    avatar: 'https://i.pravatar.cc/160?img=44',
  },
  {
    name: 'Michael Thompson',
    role: 'Startup Founder',
    location: 'Seattle, WA',
    text: 'Opening a business account took less than 15 minutes online. International wires settle quickly, and the API integrations saved my finance team hours every week. Highly recommend MorganFinance.',
    rating: 5,
    years: 'Customer since 2023',
    avatar: 'https://i.pravatar.cc/160?img=15',
  },
];

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Rated 4.9 / 5 by 12,400+ customers
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 tracking-tight">
            Trusted by people <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
              who take money seriously
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from MorganFinance customers across the United States.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 touch-pan-y">
              {testimonials.map((t, index) => (
                <div
                  key={t.name}
                  className="pl-4 min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <article className="group relative h-full bg-card rounded-2xl p-8 border border-border hover:border-primary/40 hover:shadow-elegant transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <Quote className="w-10 h-10 text-primary/15 absolute top-6 right-6 group-hover:text-primary/30 group-hover:scale-110 transition-all duration-500" />

                    <div className="relative flex flex-col h-full">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                        ))}
                      </div>

                      <p className="text-foreground/90 leading-relaxed mb-6 text-[15px] flex-1">
                        "{t.text}"
                      </p>

                      <div className="border-t border-border pt-5 flex items-center gap-3">
                        <Avatar className="w-12 h-12 ring-2 ring-background shadow-md">
                          <AvatarImage
                            src={t.avatar}
                            alt={`${t.name} profile photo`}
                            loading="lazy"
                          />
                          <AvatarFallback className="gradient-primary text-primary-foreground font-semibold text-sm">
                            {t.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {t.role} · {t.location}
                          </p>
                          <p className="text-[11px] text-primary/70 mt-0.5 font-medium">{t.years}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous testimonial"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next testimonial"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-card border border-border shadow-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">4.9/5</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Avg. Rating</div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">2M+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Customers</div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">98%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Would Recommend</div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div>
            <div className="text-3xl font-serif font-bold text-foreground">24/7</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Live Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}
