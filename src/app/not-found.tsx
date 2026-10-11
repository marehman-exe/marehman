import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-content px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
        Page not found.
      </h1>
      <p className="mt-4 max-w-md font-body text-base leading-relaxed text-muted">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center font-mono text-xs uppercase tracking-[0.08em] text-signal hover:underline"
      >
        ← back home
      </Link>
    </main>
  );
}
