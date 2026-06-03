function SkeletonBlock({ className }: { className: string }) {
  return <div className={`dl-skeleton rounded-2xl ${className}`} />;
}

export function DashboardRouteSkeleton() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-32 w-full" />
        <SkeletonBlock className="h-32 w-full" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[390px_1fr]">
        <SkeletonBlock className="h-[420px] w-full" />
        <SkeletonBlock className="h-[520px] w-full" />
      </div>
    </div>
  );
}

export function QrRouteSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-8 xl:grid-cols-[430px_1fr]">
      <SkeletonBlock className="h-[720px] w-full rounded-[1.75rem]" />
      <div className="rounded-[2rem] border border-[#e4dbce] bg-[#fffdf8] p-5 md:p-8">
        <SkeletonBlock className="h-5 w-28" />
        <SkeletonBlock className="mt-4 h-9 w-72" />
        <SkeletonBlock className="mt-4 h-5 w-full max-w-xl" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]">
          <SkeletonBlock className="h-[460px] w-full" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ListRouteSkeleton({ title }: { title: string }) {
  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--charcoal)]">
      <header className="border-b border-[#e4dbce] bg-[#fffdf8]/84 px-4 py-4 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-[var(--green)]">{title}</p>
          <SkeletonBlock className="mt-3 h-8 w-64" />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-32 w-full" />
        </div>
        <SkeletonBlock className="mt-6 h-[520px] w-full" />
      </div>
    </main>
  );
}

export function ReaderRouteSkeleton() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-white px-2 py-0 sm:px-4 sm:py-4 md:h-auto md:min-h-screen">
      <section className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center">
        <SkeletonBlock className="h-[72vh] w-full max-w-3xl rounded-[1.4rem]" />
        <div className="mt-3 flex items-center gap-3">
          <SkeletonBlock className="h-12 w-12" />
          <SkeletonBlock className="h-10 w-28 rounded-full" />
          <SkeletonBlock className="h-12 w-12" />
        </div>
      </section>
    </main>
  );
}
