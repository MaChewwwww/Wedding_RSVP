export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="flex min-h-[70svh] items-center justify-center bg-paper px-5"
    >
      <div className="text-center">
        <div
          aria-hidden
          className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-clay/25 border-t-clay"
        />
        <p className="mt-4 text-sm text-muted-ink">Preparing your invitation…</p>
      </div>
    </main>
  );
}
