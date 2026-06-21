import { Link } from 'react-router-dom';
import { ArrowRight, Shield, CheckCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroCustomerService from '@/assets/hero-customer-service.jpg';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-foreground py-20 lg:py-28 min-h-[680px] flex items-center">
      {/* Customer service photographic background */}
      <div className="absolute inset-0">
        <img
          src={heroCustomerService}
          alt="MorganFinance banker shaking hands with a customer"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-[58%_center] md:object-center animate-[heroZoom_20s_ease-in-out_infinite_alternate]"
        />
        {/* Readability scrim kept only where the copy sits, leaving the service photo fully visible */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[58%] bg-gradient-to-r from-foreground/95 via-foreground/72 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-foreground/45 via-transparent to-transparent" />
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
        <div className="grid lg:grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)] gap-12 items-center">
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
            <div className="flex items-center gap-2 text-primary-foreground/90 text-sm pt-2">
              <Phone className="w-4 h-4" />
              <span>Questions? Call us: <a href="tel:+18001234567" className="underline hover:text-primary-foreground transition-colors">+1 (800) 123-4567</a></span>
            </div>
          </div>

          <div className="hidden lg:block min-h-[520px]" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
