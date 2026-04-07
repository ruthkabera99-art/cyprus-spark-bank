import { Phone, Mail, Lock, Shield } from 'lucide-react';

export function TopBar() {
  return (
    <div className="bg-foreground text-background py-2 text-xs">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <a href="tel:+18001234567" className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <Phone className="w-3 h-3" />
            <span>+1 (800) 123-4567</span>
          </a>
          <a href="mailto:support@securebank.com" className="hidden sm:flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <Mail className="w-3 h-3" />
            <span>support@securebank.com</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 opacity-70">
            <Lock className="w-3 h-3 text-success" />
            <span>SSL Encrypted</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 opacity-70">
            <Shield className="w-3 h-3 text-success" />
            <span>FDIC Insured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
