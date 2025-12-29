import { CreditCard, Building2, Landmark, Wallet, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: CreditCard,
    title: 'Personal Banking',
    description: 'Manage your everyday finances with our comprehensive personal banking solutions including checking, savings, and credit cards.',
    link: '/personal',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Building2,
    title: 'Business Banking',
    description: 'Grow your business with our tailored financial solutions, from merchant services to business loans and treasury management.',
    link: '/business',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Landmark,
    title: 'Collateral Loans',
    description: 'Secure competitive rates with our collateral-backed lending options. Use your assets to access the funds you need.',
    link: '/loans',
    color: 'bg-gold/10 text-gold',
  },
  {
    icon: Wallet,
    title: 'Online Transactions',
    description: 'Send and receive money instantly with our secure online transaction platform. Wire transfers, ACH, and more.',
    link: '/personal',
    color: 'bg-success/10 text-success',
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Comprehensive Banking Services
          </h2>
          <p className="text-muted-foreground">
            From personal accounts to business solutions, we offer a full range of banking services to meet your financial needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link
              key={service.title}
              to={service.link}
              className="group bg-card rounded-2xl p-6 border border-border hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {service.description}
              </p>
              
              <div className="flex items-center text-primary font-medium text-sm">
                Learn More
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
