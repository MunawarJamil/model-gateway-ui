import { Link } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Zap,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  FileText,
  CheckCircle2,
  Code2,
  ExternalLink,
  Lock,
  Webhook,
  LayoutDashboard,
} from "lucide-react";

export function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const features = [
    {
      icon: Cpu,
      title: "Multi-Provider Failover",
      description:
        "Seamlessly route prompts between Google Gemini and Groq with automatic failover fallback if a provider drops or encounters rate limits.",
    },
    {
      icon: Layers,
      title: "Sync, Stream & Async Queues",
      description:
        "Execute standard REST completions, low-latency Server-Sent Events (SSE) token streaming, or background Redis BullMQ jobs.",
    },
    {
      icon: Lock,
      title: "Hashed API Key Security",
      description:
        "HMAC-SHA256 hashed API keys with strict permissions, instant revocation, and isolated user scopes.",
    },
    {
      icon: Activity,
      title: "Rate Limiting & Usage Metering",
      description:
        "Redis fixed-window rate limiting per minute with detailed token tracking, monthly quota enforcement, and live charts.",
    },
    {
      icon: FileText,
      title: "Prompt Template Engine",
      description:
        "Store and parameterize prompt templates with {{variable}} substitution for maintainable, reusable AI workflows.",
    },
    {
      icon: Webhook,
      title: "Signed Webhook Callbacks",
      description:
        "Reliable job completion webhooks with HMAC signatures, exponential backoff retries, and delivery audit logs.",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create an Account",
      description:
        "Sign up in seconds to obtain access to the gateway dashboard and manage your models.",
    },
    {
      step: "02",
      title: "Generate API Key",
      description:
        "Create secure API keys with customizable rate limits and monthly token allowances.",
    },
    {
      step: "03",
      title: "Route & Scale Prompts",
      description:
        "Send requests to a single endpoint with auto-failover, live streaming, or async queues.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* ─── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base sm:text-lg">Model Gateway</span>
            </div>
            <Badge variant="secondary" className="ml-1 text-[11px] font-normal py-0 px-2">
              v1.0
            </Badge>
          </Link>

          <nav className="hidden items-center gap-6 text-sm md:flex text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a
              href="https://model-gateway.duckdns.org/api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              Swagger Docs
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <Button asChild size="sm" className="gap-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-80" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="gap-1.5 shadow-sm">
                  <Link to="/signup">
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-32">
        <div className="container mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-sm shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>High-performance AI inference proxy</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Gemini & Groq</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            The Unified API Gateway for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              All Your AI Models
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
            One clean interface to route prompts, stream tokens, queue background tasks,
            and monitor usage across multiple LLM providers with automatic fallback reliability.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {isAuthenticated ? (
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base px-6 shadow-md">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Welcome back, {user?.name || "User"} — Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-base px-6 shadow-md">
                  <Link to="/signup">
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base px-6">
                  <Link to="/login">Sign in to console</Link>
                </Button>
              </>
            )}
          </div>

          {/* Quick metric pills */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/60 px-3 py-1.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Multi-Provider Automatic Fallback</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/60 px-3 py-1.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>SSE Streaming & Async Queues</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/60 px-3 py-1.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>HMAC Signed Webhooks</span>
            </div>
          </div>
        </div>

        {/* ─── Interactive Code / Demo Preview Card ──────────────────────── */}
        <div className="container mx-auto mt-14 max-w-4xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">POST /v1/complete</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                gateway online
              </div>
            </div>

            <div className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-y-0 md:divide-x divide-border/60">
              {/* Request */}
              <div className="p-4 sm:p-5 font-mono text-xs text-muted-foreground bg-muted/20">
                <div className="text-foreground font-semibold mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" /> Request Payload
                </div>
                <pre className="overflow-x-auto text-foreground/90">
{`{
  "provider": "gemini",
  "prompt": "Summarize user feedback",
  "temperature": 0.7,
  "stream": false
}`}
                </pre>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  Headers: <code className="text-foreground">x-api-key: mg_live_••••••</code>
                </div>
              </div>

              {/* Response */}
              <div className="p-4 sm:p-5 font-mono text-xs bg-card">
                <div className="text-foreground font-semibold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-500" /> Gateway Response
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                    200 OK • 182ms
                  </Badge>
                </div>
                <pre className="overflow-x-auto text-foreground/90">
{`{
  "provider": "gemini-2.5-flash",
  "content": "Users love the fast responses...",
  "usage": {
    "promptTokens": 14,
    "completionTokens": 32,
    "totalTokens": 46
  }
}`}
                </pre>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Fallback: Groq Ready</span>
                  <span className="text-emerald-500">Rate Limit: 59/60 req/min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border/50 bg-muted/30 py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Everything You Need to Run LLMs in Production
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              A comprehensive set of gateway features designed for engineering teams that value uptime,
              cost-control, and simplicity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-border/60 bg-card transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border/50 py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Simple to Integrate, Effortless to Scale
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Start making unified AI API calls in less than 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-start rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <span className="font-mono text-2xl font-black text-primary/40">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Banner ─────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-primary/5 py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to Streamline Your AI Infrastructure?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
            Sign up now and get your API keys to start querying Gemini and Groq models with built-in
            protection and observability.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-sm">
                  <Link to="/signup">
                    <span>Create Your Free Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border/50 bg-muted/20 py-8">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Model Gateway</span>
            <span>—</span>
            <span>Reliable Multi-LLM API Proxy</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">
              Register
            </Link>
            <a
              href="https://model-gateway.duckdns.org/api"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Swagger Docs
            </a>
          </div>

          <div>
            © {new Date().getFullYear()} Model Gateway. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
