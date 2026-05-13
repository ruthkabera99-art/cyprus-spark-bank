import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Download, Shield, Zap, Bell, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export function DownloadAppSection() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('MorganFinance app installed!');
    };
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleInstall = async (platform: 'android' | 'ios') => {
    if (isInstalled) {
      toast.info('App is already installed. Open it from your home screen.');
      return;
    }
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          toast.success('Installing MorganFinance...');
        }
        setDeferredPrompt(null);
        return;
      } catch {
        // fall through to instructions page
      }
    }
    // iOS Safari has no install prompt API — show step-by-step
    if (platform === 'ios' || isIOS) {
      navigate('/install');
      return;
    }
    // Android without prompt yet — guide user
    toast.info('Tap your browser menu, then "Install app" or "Add to Home screen".');
    navigate('/install');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-foreground via-foreground to-primary/90 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium">
              <Smartphone className="w-4 h-4 text-accent" />
              Available on All Devices
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground leading-tight">
              Bank On The Go With{' '}
              <span className="text-accent">Our Mobile App</span>
            </h2>

            <p className="text-lg text-primary-foreground/70 max-w-lg">
              Download the MorganFinance app and manage your finances anytime, anywhere. Available for both Android and iPhone — install directly from your browser.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, label: 'Instant transfers & deposits' },
                { icon: Shield, label: 'Bank-grade security' },
                { icon: Bell, label: 'Real-time notifications' },
                { icon: Smartphone, label: 'Works offline' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-primary-foreground/80">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg group"
                onClick={() => handleInstall('android')}
              >
                <Download className="mr-2 w-5 h-5" />
                {isInstalled ? 'App Installed' : deferredPrompt ? 'Install Now (Android)' : 'Download for Android'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => handleInstall('ios')}
              >
                <Download className="mr-2 w-5 h-5" />
                Download for iPhone
              </Button>
            </div>

            <p className="text-xs text-primary-foreground/50">
              {deferredPrompt
                ? 'One-tap install — no app store, no extra steps.'
                : 'No app store needed — install directly from your browser. Free to download.'}
            </p>
          </div>

          {/* Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[560px] bg-card rounded-[3rem] border-4 border-muted shadow-2xl overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-foreground rounded-b-2xl z-10" />
                
                {/* Screen content */}
                <div className="absolute inset-3 rounded-[2.2rem] overflow-hidden bg-gradient-to-b from-primary/20 to-background">
                  <div className="p-6 pt-10 space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3">
                        <Shield className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Total Balance</p>
                      <p className="text-2xl font-bold text-foreground">$124,850.00</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {['Send', 'Receive', 'Loans'].map((action) => (
                        <div key={action} className="bg-muted/50 rounded-xl p-3 text-center">
                          <div className="w-8 h-8 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground">{action}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: 'Wire Transfer', amount: '-$2,500', color: 'text-foreground' },
                        { name: 'Salary', amount: '+$8,500', color: 'text-success' },
                        { name: 'Loan Payment', amount: '-$780', color: 'text-foreground' },
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card/50">
                          <p className="text-xs font-medium text-foreground">{tx.name}</p>
                          <p className={`text-xs font-semibold ${tx.color}`}>{tx.amount}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow behind phone */}
              <div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl rounded-full scale-75" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
