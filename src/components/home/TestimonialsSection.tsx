import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Small Business Owner',
    location: 'Austin, TX',
    text: 'MorganFinance has been instrumental in growing my business. Their collateral loan process was transparent, and I always knew exactly where I stood. The team genuinely cares about their clients.',
    rating: 5,
    years: 'Customer since 2018',
    accent: 'from-primary/20 to-primary/5',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    location: 'San Francisco, CA',
    text: 'I switched to MorganFinance for the security features and stayed for the service. The 24/7 support team resolved my issue within minutes. My deposits are FDIC insured, which gives me real peace of mind.',
    rating: 5,
    years: 'Customer since 2020',
    accent: 'from-gold/20 to-gold/5',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Freelance Consultant',
    location: 'Miami, FL',
    text: 'As a freelancer, I need a bank that makes transfers fast and fees fair. MorganFinance delivers on both. Their mobile experience is the best I\'ve used, and I appreciate the clear fee disclosures.',
    rating: 5,
    years: 'Customer since 2021',
    accent: 'from-primary/20 to-primary/5',
  },
  {
    name: 'James O\'Connor',
    role: 'Real Estate Investor',
    location: 'Chicago, IL',
    text: 'I\'ve financed three property deals through MorganFinance. Their collateral-backed loans are competitively priced and funded faster than any traditional lender I\'ve worked with. Truly a partner in growth.',
    rating: 5,
    years: 'Customer since 2019',
    accent: 'from-gold/20 to-gold/5',
  },
  {
    name: 'Priya Patel',
    role: 'Doctor & Investor',
    location: 'Boston, MA',
    text: 'The wealth management tools and crypto custody at MorganFinance are unmatched. I can see my entire net worth in one dashboard, and the advisors actually listen before recommending anything.',
    rating: 5,
    years: 'Customer since 2022',
    accent: 'from-primary/20 to-primary/5',
  },
  {
    name: 'Michael Thompson',
    role: 'Startup Founder',
    location: 'Seattle, WA',
    text: 'Opening a business account took less than 15 minutes online. International wires settle quickly, and the API integrations saved my finance team hours every week. Highly recommend MorganFinance.',
    rating: 5,
    years: 'Customer since 2023',
    accent: 'from-gold/20 to-gold/5',
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="group relative bg-card rounded-2xl p-8 border border-border hover:border-primary/40 hover:shadow-elegant hover:-translate-y-1 transition-all duration-500 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${testimonial.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              <Quote className="w-10 h-10 text-primary/15 absolute top-6 right-6 group-hover:text-primary/30 group-hover:scale-110 transition-all duration-500" />

              <div className="relative">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                  ))}
                </div>

                <p className="text-foreground/90 leading-relaxed mb-6 text-[15px]">
                  "{testimonial.text}"
                </p>

                <div className="border-t border-border pt-5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-md ring-2 ring-background">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {testimonial.role} · {testimonial.location}
                    </p>
                    <p className="text-[11px] text-primary/70 mt-0.5 font-medium">{testimonial.years}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
