import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-5xl font-bold text-border">404</p>
      <p className="text-muted">Page not found.</p>
      <Link href="/" className="text-sm text-blue underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
