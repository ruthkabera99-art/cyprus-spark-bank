import { SEO } from '@/components/SEO';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CreditCard, Wallet, PiggyBank, ArrowRight, Check, Smartphone, Globe, Shield } from 'lucide-react';

const accounts = [
  {
    title: 'Checking Account',
    description: 'Everyday banking with unlimited transactions',
    features: ['No monthly fees', 'Free debit card', 'Mobile deposits', 'Bill pay'],
    icon: Wallet,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Savings Account',
    description: 'Grow your money with competitive interest rates',
    features: ['2.5% APY', 'No minimum balance', 'Auto-save features', 'Goal tracking'],
    icon: PiggyBank,
    color: 'bg-accent/10 text-accent',
  },
  {
    title: 'Premium Credit Card',
    description: 'Rewards and benefits for every purchase',
    features: ['3% cashback', 'No foreign fees', 'Travel insurance', 'Fraud protection'],
    icon: CreditCard,
    color: 'bg-gold/10 text-gold',
  },
];

const PersonalBanking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Personal Banking Solutions
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                From everyday banking to long-term savings, we offer comprehensive personal banking solutions tailored to your lifestyle.
              </p>
              <Button size="lg" className="gradient-primary shadow-elegant" asChild>
                <Link to="/register">
                  Open Account <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Account Types */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Choose Your Account</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {accounts.map((account, index) => (
                <div
                  key={account.title}
                  className="bg-card rounded-2xl p-8 border border-border hover:shadow-elegant transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${account.color} flex items-center justify-center mb-6`}>
                    <account.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">{account.title}</h3>
                  <p className="text-muted-foreground mb-6">{account.description}</p>
                  <ul className="space-y-3 mb-8">
                    {account.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Banking at Your Fingertips</h2>
                <p className="text-muted-foreground mb-8">
                  Manage your finances anytime, anywhere with our powerful mobile and online banking platform.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: Smartphone, title: 'Mobile Banking', desc: 'Deposit checks, pay bills, and transfer money from your phone' },
                    { icon: Globe, title: 'Online Banking', desc: 'Full-featured web platform for comprehensive account management' },
                    { icon: Shield, title: 'Secure Transactions', desc: 'Advanced encryption and fraud monitoring protect every transaction' },
                  ].map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border">
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center">
                  <Smartphone className="w-24 h-24 text-muted-foreground/30" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonalBanking;
