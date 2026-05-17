import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Lock, BadgeCheck } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { data: settings } = useSiteSettings();
  const phone = settings?.contact_phone ?? '+1 (800) 123-4567';
  const email = settings?.contact_email ?? 'support@morganfinancebank.com';
  const address = settings?.contact_address ?? '123 Financial District, Banking Tower, City Center';
  const nmls = settings?.nmls_number ?? '123456';
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold">MorganFinance Bank</h2>
                <p className="text-xs opacity-70">Trust & Innovation</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Your trusted partner in banking for over 50 years. We provide secure, innovative financial solutions for individuals and businesses.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Personal Banking', path: '/personal' },
                { label: 'Business Banking', path: '/business' },
                { label: 'Loans & Collateral', path: '/loans' },
                { label: 'About Us', path: '/about' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-all">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Legal & Compliance</h3>
            <ul className="space-y-3">
              {[
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Terms of Service', path: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-all">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="text-sm opacity-80">FDIC Member Institution</li>
              <li className="text-sm opacity-80">Equal Housing Lender</li>
              <li className="text-sm opacity-80">NMLS# {nmls}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif font-semibold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                <span className="text-sm opacity-80">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="text-sm opacity-80 hover:opacity-100">{phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${email}`} className="text-sm opacity-80 hover:opacity-100">{email}</a>
              </li>
            </ul>

            {/* Security Badges */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-background/10">
              <div className="flex items-center gap-1.5 text-xs opacity-60">
                <Lock className="w-3.5 h-3.5" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs opacity-60">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>PCI DSS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} MorganFinance Bank. All rights reserved. FDIC Insured. Equal Housing Lender.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link to="/terms" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}