import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              Trusted by over 2 million customers
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
              Banking Made{' '}
              <span className="text-gradient">Simple, Secure</span>{' '}
              & Smart
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Experience next-generation banking with our comprehensive suite of financial services. From personal accounts to collateral-backed loans, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gradient-primary shadow-elegant group" asChild>
                <Link to="/register">
                  Open Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-5 h-5 text-success" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-success" />
                <span>FDIC Insured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-5 h-5 text-success" />
                <span>AAA Rated</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Card */}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
