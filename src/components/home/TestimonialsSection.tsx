import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Small Business Owner',
    text: 'MorganFinance Bank has been instrumental in growing my business. Their collateral loan process was transparent, and I always knew exactly where I stood. The team genuinely cares about their clients.',
    rating: 5,
    years: 'Customer since 2018',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    text: 'I switched to MorganFinance Bank for the security features and stayed for the service. The 24/7 support team resolved my issue within minutes. My deposits are FDIC insured, which gives me real peace of mind.',
    rating: 5,
    years: 'Customer since 2020',
  },
  {
    name: 'Maria Rodriguez',
    role: 'Freelance Consultant',
    text: 'As a freelancer, I need a bank that makes transfers fast and fees fair. MorganFinance Bank delivers on both. Their mobile experience is the best I\'ve used, and I appreciate the clear fee disclosures.',
    rating: 5,
    years: 'Customer since 2021',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Real feedback from real customers who trust MorganFinance Bank with their finances.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-elegant transition-all duration-300 animate-fade-in relative"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                "{testimonial.text}"
              </p>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{testimonial.years}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}