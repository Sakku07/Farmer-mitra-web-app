export function SkeletonLine({ className = "h-4 w-full" }) {
  return <div className={`fh-skeleton rounded-md ${className}`} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="fh-skeleton h-10 w-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-3/4" />
          <SkeletonLine className="h-3 w-1/2" />
        </div>
        <SkeletonLine className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <div className="space-y-1 text-center">
          <SkeletonLine className="mx-auto h-3 w-10" />
          <SkeletonLine className="mx-auto h-5 w-14" />
        </div>
        <div className="space-y-1 border-x border-slate-100 text-center">
          <SkeletonLine className="mx-auto h-3 w-10" />
          <SkeletonLine className="mx-auto h-5 w-14" />
        </div>
        <div className="space-y-1 text-center">
          <SkeletonLine className="mx-auto h-3 w-10" />
          <SkeletonLine className="mx-auto h-5 w-14" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div data-testid="skeleton-list" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <SkeletonLine className="h-3 w-16" />
      <SkeletonLine className="mt-3 h-8 w-24" />
    </div>
  );
}

export function EmptyState({ title, hint, icon: Icon }) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center"
    >
      {Icon ? (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <p className="font-heading text-base font-semibold text-slate-800">{title}</p>
      {hint ? <p className="mt-1 max-w-xs text-sm text-slate-500">{hint}</p> : null}
    </div>
  );
}
