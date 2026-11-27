import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";

export default function SearchPage() {
  return (
    <section className="min-h-[70vh] bg-slate-50/70 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Search</p>
        <h1 className="mb-8 mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Ask EAiQ</h1>
        <Suspense fallback={<p className="text-sm text-slate-400">Loading results…</p>}>
          <SearchResults />
        </Suspense>
      </div>
    </section>
  );
}
