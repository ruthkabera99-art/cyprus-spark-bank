import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-12 md:p-16 text-center">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
              Ready to Start Banking Smarter?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Join over 2 million customers who trust MorganFinance Bank for their financial needs. Open your account in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="group" asChild>
                <Link to="/register">
                  Open Account Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Phone className="mr-2 w-5 h-5" />
                Call Us: (800) 123-4567
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
