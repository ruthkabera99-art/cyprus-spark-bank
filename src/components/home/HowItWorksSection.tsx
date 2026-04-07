import { UserPlus, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Create Your Account',
    description: 'Sign up in under 10 minutes with a valid ID. Instant verification for most applicants.',
  },
  {
    icon: ShieldCheck,
    step: '02',
    title: 'Verify Your Identity',
    description: 'Complete our secure KYC process. Your data is encrypted and never shared with third parties.',
  },
  {
    icon: Wallet,
    step: '03',
    title: 'Start Banking Safely',
    description: 'Deposit funds, apply for loans, or transfer money — all protected by bank-grade security.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Getting started with SecureBank is quick, safe, and straightforward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

          {steps.map((step, index) => (
            <div
              key={step.step}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Step number */}
              <div className="relative z-10 w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center shadow-elegant mb-6">
                <step.icon className="w-9 h-9 text-primary-foreground" />
              </div>
              <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                Step {step.step}
              </span>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
