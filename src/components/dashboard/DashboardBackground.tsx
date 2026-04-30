/**
 * @file: DashboardBackground.tsx
 * @responsibility: Dashboard decorative background — gradient base + subtle blobs (light/dark)
 * @exports: DashboardBackground
 * @imports: none
 * @layer: components
 */

export function DashboardBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Base gradient — theme-aware */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.6) 50%, hsl(var(--primary) / 0.08) 100%)",
        }}
      />
      {/* Soft radial overlay for depth */}
      <div
        className="absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.12), transparent 60%)",
        }}
      />
      {/* Blob 1 — primary/purple, top-right */}
      <div
        className="absolute -top-20 -right-20 h-[320px] w-[320px] rounded-full opacity-30 dark:opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Blob 2 — teal accent, bottom-left */}
      <div
        className="absolute -bottom-24 -left-24 h-[280px] w-[280px] rounded-full opacity-25 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(var(--clickup-teal) / 0.35), transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      {/* Blob 3 — purple accent, center-right */}
      <div
        className="absolute top-1/2 right-0 h-[240px] w-[240px] -translate-y-1/2 rounded-full opacity-20 dark:opacity-12"
        style={{
          background: "radial-gradient(circle, hsl(var(--clickup-purple) / 0.3), transparent 70%)",
          filter: "blur(48px)",
        }}
      />
    </div>
  );
}
