import { Shield, Lock, Award, BadgeCheck, FileCheck, CreditCard } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Multi-factor Login',
    description: 'Extra verification protects account access',
  },
  {
    icon: Lock,
    title: '256-bit SSL Encryption',
    description: 'Bank-grade encryption protects all data in transit',
  },
  {
    icon: BadgeCheck,
    title: 'Activity Monitoring',
    description: 'Real-time alerts on account activity',
  },
  {
    icon: FileCheck,
    title: 'Identity Verification',
    description: 'Customer checks on account opening',
  },
  {
    icon: Award,
    title: 'Admin-reviewed Transfers',
    description: 'Transactions reviewed before completion',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Encrypted transaction processing',
  },
];

export function TrustBadgesSection() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            Your Security Is Our Priority
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            We use layered security to protect your financial data and transactions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                <badge.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-xs mb-1">{badge.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-tight">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}