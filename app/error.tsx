"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <p className="text-red-500 text-sm font-mono mb-2">Error</p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-zinc-500 text-sm max-w-sm">{error.message || "An unexpected error occurred."}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
