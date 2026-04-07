import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-zinc-600 text-sm font-mono mb-2">404</p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-zinc-500 text-sm">This page doesn&apos;t exist.</p>
      </div>
      <Link
        href="/"
        className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
      >
        Back to RepoMind
      </Link>
    </div>
  );
}
