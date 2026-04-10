import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Shield, CheckCircle, Share, PlusSquare, MoreVertical } from 'lucide-react';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Download MorganFinance App
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Install our app on your phone for quick and secure access to your banking.
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">App Already Installed!</h2>
                <p className="text-muted-foreground">
                  MorganFinance is already installed on your device. Open it from your home screen.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Direct install button (Android / Desktop Chrome) */}
              {deferredPrompt && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-6 text-center space-y-4">
                    <Smartphone className="w-12 h-12 text-primary mx-auto" />
                    <h2 className="text-xl font-bold">Install Now</h2>
                    <p className="text-muted-foreground">Tap the button below to install MorganFinance on your device.</p>
                    <Button size="lg" onClick={handleInstall} className="gap-2">
                      <Download className="w-5 h-5" />
                      Install MorganFinance App
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Android Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-500" />
                    </div>
                    Android Installation
                  </CardTitle>
                  <CardDescription>For Samsung, Google Pixel, and other Android phones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {[
                      { icon: MoreVertical, text: 'Open this page in Chrome browser' },
                      { icon: MoreVertical, text: 'Tap the three-dot menu (⋮) in the top-right corner' },
                      { icon: PlusSquare, text: 'Select "Add to Home screen" or "Install app"' },
                      { icon: CheckCircle, text: 'Tap "Install" to confirm — the app icon will appear on your home screen' },
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <p className="text-foreground pt-1">{step.text}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* iOS Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                    </div>
                    iPhone / iPad Installation
                  </CardTitle>
                  <CardDescription>For all Apple devices using Safari</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {[
                      { icon: Share, text: 'Open this page in Safari browser' },
                      { icon: Share, text: 'Tap the Share button (□↑) at the bottom of the screen' },
                      { icon: PlusSquare, text: 'Scroll down and tap "Add to Home Screen"' },
                      { icon: CheckCircle, text: 'Tap "Add" — the app icon will appear on your home screen' },
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <p className="text-foreground pt-1">{step.text}</p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <h3 className="font-bold text-foreground mb-4 text-center">Why Install the App?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Instant access from your home screen',
                      'Works offline — check balances anytime',
                      'Faster loading than the browser',
                      'Push notifications for transactions',
                      'Full-screen experience like a native app',
                      'Free — no app store download needed',
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Install;
