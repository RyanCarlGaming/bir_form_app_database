import { useLocation } from "wouter";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-blue flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="13" y2="16" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-lg leading-none text-text">BIR Portal</p>
              <p className="text-xs leading-none mt-0.5 text-muted">Form 1902</p>
            </div>
          </div>

          {/* Center Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-2 hover:text-blue transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-text-2 hover:text-blue transition-colors">
              How it Works
            </a>
            <a href="#about" className="text-sm text-text-2 hover:text-blue transition-colors">
              About BIR
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sign-in")}
              className="text-sm font-semibold text-blue hover:text-blue/80 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/sign-in")}
              className="px-4 py-2 rounded-lg bg-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-canvas to-surface">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue/10 border border-blue/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green" />
            <span className="text-xs font-semibold text-blue uppercase tracking-widest">SQLite Database ONLINE</span>
          </div>

          <h1 className="text-5xl md:text-5xl font-extrabold text-text tracking-tight leading-tight mb-6">
            TIN-Link: <span className="text-blue">Automated</span> Employee Registration System 
          </h1>

          <p className="text-lg md:text-xl text-text-2 max-w-2xl mx-auto mb-12">
            Digitize employee TIN registration with our structured, normalized form system. Submit applications,
            track status, and manage records all in one portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/sign-in")}
              className="px-8 py-3 rounded-lg bg-blue text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
            {[
              { val: "Group Members", label: ["Ryan Carl A. Concepcion", "Rhylle Medina", "Jino Gabriel Tuastomban", "Jaycee Baquing", "Daniel Flor"] },
              { val: "School / University", label: "Polytechnic University of the Philippines - Main" },
              { val: "Database", label: "SQLite" },
            ].map(({ val, label }) => (
              <div key={val} className="flex flex-col gap-2">
                <span className="font-mono text-2xl font-bold text-blue">{val}</span>
                {Array.isArray(label) ? (
                  <div className="text-xs text-muted uppercase tracking-widest flex flex-col gap-1">
                    {label.map((item, index) => (
                      <span key={index}>{item}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted uppercase tracking-widest">{label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-blue uppercase tracking-widest">Features</span>
          <h2 className="text-4xl font-bold text-text mt-3 mb-4">Everything you need</h2>
          <p className="text-lg text-text-2 max-w-2xl mx-auto">
            Comprehensive tools to streamline your BIR Form 1902 registration process
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Digital Forms",
              desc: "Structured, normalized forms that replace paper applications with verified digital records.",
              icon: "📋",
            },
            {
              title: "Real-time Tracking",
              desc: "Monitor your application status, verify information, and receive instant notifications.",
              icon: "📊",
            },
            {
              title: "Secure Storage",
              desc: "Enterprise-grade encryption ensures your sensitive taxpayer information remains protected.",
              icon: "🔒",
            },
            {
              title: "Easy Search",
              desc: "Quickly find and access forms across offices with powerful search and filter capabilities.",
              icon: "🔍",
            },
            {
              title: "Audit Logs",
              desc: "Complete visibility into all activities with comprehensive audit trails for compliance.",
              icon: "📜",
            },
            {
              title: "API Integration",
              desc: "Connect with other BIR systems and automate workflows across your organization.",
              icon: "⚙️",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg border border-border bg-surface hover:border-border-strong transition-colors group"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg text-text mb-2">{feature.title}</h3>
              <p className="text-sm text-text-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-blue uppercase tracking-widest">Process</span>
          <h2 className="text-4xl font-bold text-text mt-3 mb-4">How it works</h2>
          <p className="text-lg text-text-2 max-w-2xl mx-auto">
            Simple steps to register for your employee TIN
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Create Account",
              desc: "Register with your office credentials to get started",
            },
            {
              step: "02",
              title: "Fill Form",
              desc: "Complete the structured Form 1902 with employee details",
            },
            {
              step: "03",
              title: "Review & Submit",
              desc: "Verify information and submit for processing",
            },
            {
              step: "04",
              title: "Get TIN",
              desc: "Receive your 9-digit TIN within 10 business days",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative">
              <div className="text-5xl font-bold text-blue/20 mb-4">{item.step}</div>
              <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
              <p className="text-sm text-text-2">{item.desc}</p>
              {idx < 3 && (
                <div className="hidden md:block absolute top-8 -right-3 text-blue/40">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* About BIR Section */}
      <section id="about" className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue uppercase tracking-widest">About</span>
            <h2 className="text-4xl font-bold text-text mt-3 mb-4">About BIR Form 1902</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-text mb-4">What is Form 1902?</h3>
              <p className="text-text-2 mb-4">
                BIR Form 1902 is the application form for Employee Individual Income Tax Return (ITR). 
                It's used to register employees for taxation purposes and obtain a 9-digit Tax Identification Number (TIN).
              </p>
              <p className="text-text-2 mb-6">
                This digital portal transforms the traditional paper-based application process into a 
                streamlined, verified, and searchable system that ensures data accuracy and faster processing.
              </p>

              <div className="space-y-4">
                {[
                  "9-digit TIN issuance",
                  "10-day processing window",
                  "Normalized 3NF database schema",
                  "Complete audit trail",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green" />
                    <span className="text-text-2">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-canvas rounded-lg p-8 border border-border">
              <h4 className="font-bold text-text mb-4">Key Information</h4>
              <div className="space-y-4">
                {[
                  { label: "Form Type", value: "Employee TIN Registration" },
                  { label: "Processing Time", value: "10 business days" },
                  { label: "Issued Identifier", value: "9-digit TIN" },
                  { label: "Authority", value: "Bureau of Internal Revenue (BIR)" },
                  { label: "Application Method", value: "Online Portal" },
                ].map((info, idx) => (
                  <div key={idx} className="flex justify-between py-3 border-b border-border last:border-b-0">
                    <span className="text-sm text-muted font-semibold">{info.label}</span>
                    <span className="text-sm text-text font-semibold">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Join thousands of offices using our digital BIR Form 1902 registration system
          </p>
          <button
            onClick={() => navigate("/sign-in")}
            className="px-8 py-3 rounded-lg bg-blue text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <rect x="4" y="3" width="16" height="18" rx="2" />
                    <line x1="8" y1="8" x2="16" y2="8" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="8" y1="16" x2="13" y2="16" />
                  </svg>
                </div>
                <span className="font-bold text-text">BIR Portal</span>
              </div>
              <p className="text-sm text-text-2">
                Digital BIR Form 1902 registration system
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-text mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "How it Works", "Pricing", "Security"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-2 hover:text-blue transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text mb-4">Company</h4>
              <ul className="space-y-2">
                {["About", "Blog", "Contact", "Support"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-2 hover:text-blue transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "Cookies", "Compliance"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-2 hover:text-blue transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted">
              © 2026 BIR Online Registration. All rights reserved.
            </p>
            <p className="text-xs text-muted mt-4 md:mt-0">
              PUP · CCIS · COMP 010 · Group 2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
