import { CreditCard, Shield, Lock, BadgeCheck } from 'lucide-react';

export function PaymentPartnersSection() {
  return (
    <section className="py-10 bg-muted/20 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trusted Payment Partners & Security Standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {/* Payment logos as styled text badges for reliability */}
            {[
              { name: 'VISA', bg: 'bg-[hsl(220,80%,25%)]', text: 'text-[hsl(0,0%,100%)]' },
              { name: 'Mastercard', bg: 'bg-[hsl(15,90%,50%)]', text: 'text-[hsl(0,0%,100%)]' },
              { name: 'PayPal', bg: 'bg-[hsl(210,70%,40%)]', text: 'text-[hsl(0,0%,100%)]' },
              { name: 'SWIFT', bg: 'bg-foreground', text: 'text-background' },
            ].map((partner) => (
              <div
                key={partner.name}
                className={`${partner.bg} ${partner.text} px-5 py-2 rounded-lg text-sm font-bold tracking-wide opacity-80 hover:opacity-100 transition-opacity`}
              >
                {partner.name}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-success" />
              <span>PCI DSS Level 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-success" />
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-success" />
              <span>AML Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-success" />
              <span>3D Secure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
