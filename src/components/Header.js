"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-black/5">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black text-brand-teal tracking-tight">
          ArthSaathi
        </Link>
        
        <div className="flex gap-8 items-center">
          <div className="flex gap-6 items-center">
            <Link 
              href="/loan-analyzer" 
              className={`nav-link ${isActive("/loan-analyzer") ? "nav-link-active" : ""}`}
            >
              Analyzer
            </Link>
            <Link 
              href="/simulator" 
              className={`nav-link relative ${isActive("/simulator") ? "nav-link-active" : ""}`}
            >
              Visualize
              <span className="absolute -top-1 -right-2 bg-amber-400 text-[8px] font-black px-1 rounded text-white animate-pulse">NEW</span>
            </Link>
            <Link 
              href="/calculator" 
              className={`nav-link ${isActive("/calculator") ? "nav-link-active" : ""}`}
            >
              Calculator
            </Link>
            <Link 
              href="/summarizer" 
              className={`nav-link ${isActive("/summarizer") ? "nav-link-active" : ""}`}
            >
              Summarizer
            </Link>
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden md:block" />

          <select 
            className="standard-select !w-auto !py-2 !px-4"
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </nav>
    </header>
  );
}
