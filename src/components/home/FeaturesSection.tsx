import { Shield, Zap, Globe, Clock, Lock, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Your funds are protected with 256-bit encryption and multi-factor authentication.',
  },
  {
    icon: Zap,
    title: 'Instant Transfers',
    description: 'Send money domestically or internationally in seconds, not days.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Access your accounts from anywhere in the world, 24/7.',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Our digital banking services are available round the clock.',
  },
  {
    icon: Lock,
    title: 'FDIC Insured',
    description: 'Your deposits are insured up to $250,000 by the FDIC.',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Our dedicated team is always ready to assist you with any queries.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Why Choose MorganFinance Bank?
          </h2>
          <p className="text-muted-foreground">
            We combine cutting-edge technology with decades of banking expertise to deliver an unmatched banking experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-elegant">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
