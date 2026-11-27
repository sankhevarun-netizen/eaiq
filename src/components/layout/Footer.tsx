import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="bg-brand-navy py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center">
            <Logo dark className="text-base" />
          </Link>
          <nav className="flex gap-6 text-sm text-slate-400">
            {["Privacy Policy", "Terms of Use", "Contact"].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-white">
                {l}
              </a>
            ))}
          </nav>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} EAiQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
