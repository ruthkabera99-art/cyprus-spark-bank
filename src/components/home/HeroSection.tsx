import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Lock, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-primary/90 py-20 lg:py-28">
      {/* Subtle geometric background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Trust chip */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium">
              <Shield className="w-4 h-4 text-success" />
              FDIC Insured · Trusted by 2M+ Customers
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight">
              Secure Banking{' '}
              <span className="text-accent">You Can Trust</span>
            </h1>

            <p className="text-lg text-primary-foreground/75 max-w-lg leading-relaxed">
              Personal & business banking, collateral-backed loans, and secure digital transactions — protected by 256-bit encryption and backed by 50+ years of financial expertise.
            </p>

            {/* Key benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'No hidden fees or charges',
                'FDIC insured up to $250K',
                '24/7 customer support',
                'Bank-grade security',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg group" asChild>
                <Link to="/register">
                  Get Started Safely
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8" asChild>
                <Link to="/login">
                  Login to Your Account
                </Link>
              </Button>
            </div>

            {/* Contact line */}
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm pt-2">
              <Phone className="w-4 h-4" />
              <span>Questions? Call us: <a href="tel:+18001234567" className="underline hover:text-primary-foreground transition-colors">+1 (800) 123-4567</a></span>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10">
              {/* Main Card */}
              <div className="bg-card rounded-3xl shadow-elegant p-8 border border-border">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <h2 className="text-4xl font-bold text-foreground mt-1">$124,850.00</h2>
                  </div>
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-success/10">
                    <p className="text-xs text-muted-foreground mb-1">Income</p>
                    <p className="text-lg font-semibold text-success">+$12,450</p>
                  </div>
                  <div className="p-4 rounded-xl bg-destructive/10">
                    <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                    <p className="text-lg font-semibold text-destructive">-$3,280</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Wire Transfer', amount: '-$2,500.00', time: '2 hours ago' },
                    { name: 'Salary Deposit', amount: '+$8,500.00', time: 'Yesterday' },
                    { name: 'Loan Payment', amount: '-$780.00', time: '2 days ago' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{tx.name}</p>
                        <p className="text-xs text-muted-foreground">{tx.time}</p>
                      </div>
                      <p className={`font-semibold ${tx.amount.startsWith('+') ? 'text-success' : 'text-foreground'}`}>
                        {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-elegant p-4 border border-border animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shadow-gold">
                    <TrendingUp className="w-6 h-6 text-gold-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Savings Growth</p>
                    <p className="font-bold text-foreground">+18.5% <span className="text-success text-xs">↑</span></p>
                  </div>
                </div>
              </div>

              {/* Security floating badge */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-elegant p-3 border border-border animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-success" />
                  <span className="text-xs font-semibold text-foreground">256-bit Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
