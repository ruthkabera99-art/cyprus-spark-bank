import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Landmark, Home, Car, Briefcase, ArrowRight, Check, Calculator, FileCheck, Clock, Shield } from 'lucide-react';

const loanTypes = [
  {
    title: 'Collateral Loans',
    description: 'Use your assets as security for competitive rates',
    features: ['Lower interest rates', 'Higher loan amounts', 'Flexible terms', 'Quick approval'],
    icon: Landmark,
    rate: 'From 4.5% APR',
    color: 'bg-gold/10 text-gold',
  },
  {
    title: 'Mortgage Loans',
    description: 'Finance your dream home with competitive rates',
    features: ['Fixed & variable rates', 'Up to 30-year terms', 'First-time buyer programs', 'Refinancing options'],
    icon: Home,
    rate: 'From 5.25% APR',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Auto Loans',
    description: 'Drive your perfect vehicle with flexible financing',
    features: ['New & used vehicles', 'No down payment options', 'Same-day approval', 'Dealer partnerships'],
    icon: Car,
    rate: 'From 3.99% APR',
    color: 'bg-accent/10 text-accent',
  },
  {
    title: 'Business Loans',
    description: 'Fuel your business growth with capital',
    features: ['Working capital', 'Equipment financing', 'Lines of credit', 'SBA loans'],
    icon: Briefcase,
    rate: 'From 6.0% APR',
    color: 'bg-success/10 text-success',
  },
];

const collateralTypes = [
  'Real Estate Properties',
  'Vehicles & Equipment',
  'Investment Portfolios',
  'Certificates of Deposit',
  'Precious Metals',
  'Business Assets',
];

const Loans = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-gold/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Loans & Collateral Services
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Access the funds you need with our comprehensive lending solutions. From collateral-backed loans to mortgages, we offer competitive rates and flexible terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gradient-primary shadow-elegant" asChild>
                  <Link to="/register">
                    Apply Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  <Calculator className="mr-2 w-5 h-5" /> Calculate Rates
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Loan Types */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Our Loan Products</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {loanTypes.map((loan, index) => (
                <div
                  key={loan.title}
                  className="bg-card rounded-2xl p-8 border border-border hover:shadow-elegant transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${loan.color} flex items-center justify-center`}>
                      <loan.icon className="w-8 h-8" />
                    </div>
                    <span className="px-4 py-2 rounded-full bg-success/10 text-success text-sm font-semibold">
                      {loan.rate}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">{loan.title}</h3>
                  <p className="text-muted-foreground mb-6">{loan.description}</p>
                  <ul className="grid grid-cols-2 gap-3 mb-6">
                    {loan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/register">Apply Now</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collateral Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Collateral-Based Lending</h2>
                <p className="text-muted-foreground mb-8">
                  Leverage your assets to access larger loan amounts at lower interest rates. Our collateral loan program accepts a wide variety of assets as security.
                </p>
                
                <h3 className="font-semibold mb-4">Accepted Collateral Types:</h3>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {collateralTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>

                <Button className="gradient-primary shadow-elegant" asChild>
                  <Link to="/register">
                    Get Pre-Approved <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>

              <div className="bg-card rounded-3xl p-8 shadow-elegant border border-border">
                <h3 className="text-xl font-serif font-semibold mb-6">How Collateral Loans Work</h3>
                <div className="space-y-6">
                  {[
                    { icon: FileCheck, title: 'Submit Application', desc: 'Apply online with your asset details' },
                    { icon: Shield, title: 'Asset Valuation', desc: 'We assess your collateral value' },
                    { icon: Clock, title: 'Quick Approval', desc: 'Get approved within 24-48 hours' },
                    { icon: Landmark, title: 'Receive Funds', desc: 'Funds deposited to your account' },
                  ].map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-elegant">
                        <span className="text-primary-foreground font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-primary via-primary to-accent rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <Calculator className="w-16 h-16 text-primary-foreground mx-auto mb-6" />
                <h2 className="text-3xl font-serif font-bold text-primary-foreground mb-4">
                  Calculate Your Loan
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                  Use our loan calculator to estimate your monthly payments and find the best loan option for your needs.
                </p>
                <Button size="lg" variant="secondary">
                  Open Loan Calculator
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Loans;
