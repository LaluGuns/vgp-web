import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#060216] text-center">
      <div className="glass-card max-w-sm w-full p-8 space-y-4">
        <div className="text-primary font-mono text-5xl font-bold tracking-tighter glow-text-primary">
          404
        </div>
        <h1 className="text-lg font-bold text-white">Lost the flow</h1>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">
          This page doesn&rsquo;t exist. Let&rsquo;s get you back in the zone.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/25 transition-colors"
        >
          Back to Flow
        </Link>
      </div>
    </main>
  );
}
