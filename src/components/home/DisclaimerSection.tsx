import { Info } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

export function DisclaimerSection() {
  const c = useSiteContent();
  return (
    <section className="py-8 bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-3 items-start max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              <strong>Important Disclosures:</strong> {c.disclaimer_text}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              © {new Date().getFullYear()} {c.footer_copyright}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
