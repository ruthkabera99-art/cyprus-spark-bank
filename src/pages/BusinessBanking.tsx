import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, TrendingUp, ArrowRight, Check, Users, BarChart3, FileText } from 'lucide-react';

const solutions = [
  {
    title: 'Business Checking',
    description: 'Streamlined banking for businesses of all sizes',
    features: ['Unlimited transactions', 'Free wire transfers', 'Cash management', 'API integration'],
    icon: Briefcase,
  },
  {
    title: 'Business Loans',
    description: 'Flexible financing to fuel your growth',
    features: ['Competitive rates', 'Quick approval', 'Flexible terms', 'No prepayment penalty'],
    icon: TrendingUp,
  },
  {
    title: 'Merchant Services',
    description: 'Accept payments anywhere, anytime',
    features: ['POS systems', 'Online payments', 'Mobile payments', 'Next-day deposits'],
    icon: Building2,
  },
];

const BusinessBanking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
                Business Banking Solutions
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Powerful financial tools and dedicated support to help your business thrive. From startups to enterprises, we've got you covered.
              </p>
              <Button size="lg" className="gradient-primary shadow-elegant" asChild>
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">Business Solutions</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <div
                  key={solution.title}
                  className="bg-card rounded-2xl p-8 border border-border hover:shadow-elegant transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                    <solution.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-2">{solution.title}</h3>
                  <p className="text-muted-foreground mb-6">{solution.description}</p>
                  <ul className="space-y-3 mb-8">
                    {solution.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/register">Learn More</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-serif font-bold mb-4">Why Businesses Choose Us</h2>
              <p className="text-muted-foreground">
                Join thousands of businesses that trust SecureBank for their financial needs.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Users, title: 'Dedicated Team', desc: 'Your own relationship manager and support team' },
                { icon: BarChart3, title: 'Advanced Analytics', desc: 'Real-time insights into your business finances' },
                { icon: FileText, title: 'Seamless Integration', desc: 'Connect with your accounting and ERP systems' },
              ].map((benefit, index) => (
                <div key={benefit.title} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessBanking;
