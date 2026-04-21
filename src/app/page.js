import Link from "next/link";

function ToolCard({ title, description, href, icon, isSoon = false, isPremium = false }) {
  return (
    <div className={`premium-card relative group flex flex-col ${isSoon ? 'opacity-80' : ''} ${isPremium ? 'bg-gradient-to-br from-zinc-900 to-black text-white border-zinc-800' : ''}`}>
      <div className={`icon-circle ${isPremium ? 'bg-sky-500/10 text-sky-400' : ''}`}>
        {icon}
      </div>
      <h2 className={`text-2xl font-bold mb-2 font-manrope leading-tight ${isPremium ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
      <p className={`leading-relaxed mb-6 flex-grow text-sm md:text-base ${isPremium ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
      
      {isSoon ? (
        <span className="text-zinc-400 font-bold flex items-center gap-2 mt-auto">
          Coming soon
        </span>
      ) : (
        <Link 
          href={href} 
          className={`${isPremium ? 'text-sky-400' : 'text-brand-teal'} font-extrabold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto`}
        >
          Open <span className="text-xl">→</span>
        </Link>
      )}

      {isSoon && (
        <span className="absolute top-8 right-8 bg-zinc-100 text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
          Soon
        </span>
      )}
      
      {isPremium && (
        <span className="absolute top-8 right-8 bg-sky-500 text-white text-[8px] font-black px-2 py-1 rounded tracking-widest uppercase animate-pulse">
          Premium
        </span>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center py-16 px-6">
      <div className="text-center max-w-2xl mb-12 space-y-4">
        <div className="w-24 h-2 bg-brand-teal mx-auto mb-6 rounded-full" />
        <p className="text-zinc-600 font-medium text-lg lg:text-xl leading-snug">
          Pick a tool below — analyze your loan, learn the basics, or get smart suggestions. Everything in plain language, no jargon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl w-full">
        <ToolCard 
          icon="⚡"
          title="Loan Simulator"
          description="Advanced financial terminal to project prepayment impact and interest savings with interactive charts."
          href="/simulator"
          isPremium={true}
        />
        <ToolCard 
          icon="📊"
          title="Loan Analyzer"
          description="Calculate EMI, total interest, and loan progress in seconds."
          href="/loan-analyzer"
        />
        <ToolCard 
          icon="📖"
          title="Loan Info"
          description="Learn loan types & interest types with simple examples — English, हिंदी or Hinglish."
          href="/calculator"
        />
        <ToolCard 
          icon="📈"
          title="Smart Insights"
          description="Personalised tips to save interest and close loans faster."
          href="/summarizer"
        />
        <ToolCard 
          icon="✨"
          title="AI Money Coach"
          description="Chat with ArthSaathi for friendly answers in your language."
          href="#"
          isSoon={true}
        />
      </div>
    </div>
  );
}
