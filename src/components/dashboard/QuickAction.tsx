import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
  variant?: 'default' | 'outline';
}

export function QuickAction({ icon: Icon, label, description, to, variant = 'outline' }: QuickActionProps) {
  return (
    <Link to={to} className="block">
      <div className="group bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{label}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
