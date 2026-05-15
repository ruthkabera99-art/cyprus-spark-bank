import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ExternalLink, Copy, Search, Globe } from "lucide-react";
import { toast } from "sonner";
import { SeoScanPanel } from "./SeoScanPanel";

const SITE_URL = "https://morganfinance.us/";
const SITEMAP_URL = "https://morganfinance.us/sitemap.xml";
const STORAGE_KEY = "seo_verification_steps_v1";

type Step = {
  id: string;
  title: string;
  description: string;
  link?: { label: string; href: string };
  copyable?: string;
};

type Section = {
  id: "google" | "bing";
  title: string;
  icon: typeof Search;
  console: string;
  steps: Step[];
};

const SECTIONS: Section[] = [
  {
    id: "google",
    title: "Google Search Console",
    icon: Search,
    console: "https://search.google.com/search-console",
    steps: [
      {
        id: "g1",
        title: "Open Search Console",
        description: "Sign in with your Google account.",
        link: { label: "Open Search Console", href: "https://search.google.com/search-console/welcome" },
      },
      {
        id: "g2",
        title: "Add property (URL prefix)",
        description: `Choose "URL prefix" and paste your site URL.`,
        copyable: SITE_URL,
      },
      {
        id: "g3",
        title: "Choose HTML tag verification",
        description: `Copy the meta tag Google gives you and paste it back in chat — I'll add it to index.html and redeploy.`,
      },
      {
        id: "g4",
        title: "Click Verify",
        description: "After redeploy completes, return to Search Console and press Verify.",
      },
      {
        id: "g5",
        title: "Submit sitemap",
        description: `Sitemaps → enter sitemap.xml → Submit.`,
        copyable: SITEMAP_URL,
        link: { label: "Open Sitemaps", href: "https://search.google.com/search-console/sitemaps" },
      },
    ],
  },
  {
    id: "bing",
    title: "Bing Webmaster Tools",
    icon: Globe,
    console: "https://www.bing.com/webmasters",
    steps: [
      {
        id: "b1",
        title: "Open Bing Webmaster Tools",
        description: "Sign in with Microsoft, Google, or Facebook.",
        link: { label: "Open Webmaster Tools", href: "https://www.bing.com/webmasters" },
      },
      {
        id: "b2",
        title: "Import from Google Search Console (fastest)",
        description: "If you finished Google verification, click Import to skip Bing verification entirely.",
      },
      {
        id: "b3",
        title: "Or add site manually",
        description: `Add Site → paste your URL → choose XML Sitemap verification.`,
        copyable: SITE_URL,
      },
      {
        id: "b4",
        title: "Submit sitemap",
        description: `Sitemaps → Submit sitemap → paste your sitemap URL.`,
        copyable: SITEMAP_URL,
      },
    ],
  },
];

export function SeoVerification() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const totalSteps = SECTIONS.reduce((n, s) => n + s.steps.length, 0);
  const doneSteps = Object.values(completed).filter(Boolean).length;
  const overall = Math.round((doneSteps / totalSteps) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>SEO Verification Checklist</CardTitle>
              <CardDescription>
                Step-by-step setup for Google Search Console and Bing Webmaster Tools.
              </CardDescription>
            </div>
            <Badge variant={overall === 100 ? "default" : "secondary"} className="shrink-0">
              {doneSteps}/{totalSteps} steps
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overall} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Overall progress: {overall}%
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const sectionDone = section.steps.every((s) => completed[s.id]);
          const sectionCount = section.steps.filter((s) => completed[s.id]).length;
          return (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  <Badge variant={sectionDone ? "default" : "outline"}>
                    {sectionDone ? "Verified" : `${sectionCount}/${section.steps.length}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.steps.map((step, idx) => {
                  const done = !!completed[step.id];
                  return (
                    <div
                      key={step.id}
                      className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
                    >
                      <Checkbox
                        checked={done}
                        onCheckedChange={() => toggle(step.id)}
                        className="mt-1"
                        aria-label={`Mark step ${idx + 1} complete`}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <p className={`font-medium ${done ? "line-through text-muted-foreground" : ""}`}>
                            {idx + 1}. {step.title}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.copyable && (
                          <div className="flex items-center gap-2 bg-muted rounded px-2 py-1">
                            <code className="text-xs flex-1 break-all">{step.copyable}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => copy(step.copyable!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {step.link && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7"
                          >
                            <a href={step.link.href} target="_blank" rel="noopener noreferrer">
                              {step.link.label}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
