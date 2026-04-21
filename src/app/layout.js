import { LanguageProvider } from "@/context/LanguageContext";
import { LoanProvider } from "@/context/LoanContext";
import Header from "@/components/Header";
import ChatBot from "./loan-analyzer/components/ChatBot";
import "./globals.css";

export const metadata = {
  title: "ArthSaathi - Multi-Tool Platform",
  description: "Unified financial and analysis dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-brand-bg min-h-screen font-manrope">
        <LanguageProvider>
          <LoanProvider>
            <Header />
            <main className="max-w-6xl mx-auto py-8">
              {children}
            </main>
            <ChatBot />
            <footer className="border-t border-black/5 mt-20 py-12">
              <div className="max-w-6xl mx-auto px-6 text-center text-zinc-400 text-sm font-medium">
                © 2026 ArthSaathi. All calculations are for informational purposes only.
              </div>
            </footer>
          </LoanProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
