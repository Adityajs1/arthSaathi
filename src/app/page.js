import Link from "next/link";

function ToolCard({ title, description, href, icon, isSoon = false, isPremium = false }) {
  return (
    <div className={`premium-card relative group flex flex-col ${isSoon ? 'opacity-80' : ''} bg-gradient-to-br from-brand-teal to-brand-teal-deep text-white border-brand-teal-deep shadow-xl shadow-brand-teal/20`}>
      <div className={`icon-circle ${isPremium ? 'bg-white/10 text-white' : 'bg-white/10 text-brand-teal-soft'}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2 font-manrope leading-tight text-white">{title}</h2>
      <p className="leading-relaxed mb-6 flex-grow text-sm md:text-base text-brand-teal-soft/80">{description}</p>
      
      {isSoon ? (
        <span className="text-brand-teal-soft/50 font-bold flex items-center gap-2 mt-auto">
          Coming soon
        </span>
      ) : (
        <Link 
          href={href} 
          className="text-white font-extrabold flex items-center gap-2 group-hover:gap-4 transition-all mt-auto"
        >
          Open <span className="text-xl">→</span>
        </Link>
      )}

      {isSoon && (
        <span className="absolute top-8 right-8 bg-white/10 text-brand-teal-soft text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
          Soon
        </span>
      )}
      
      {isPremium && (
        <span className="absolute top-8 right-8 bg-amber-400 text-brand-teal-deep text-[8px] font-black px-2 py-1 rounded tracking-widest uppercase animate-pulse">
          Premium
        </span>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center py-16 px-6">
      <div className="text-center max-w-3xl mb-12 space-y-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-brand-zinc mb-8">
          Master Your Loans & <span className="text-brand-teal">Save Money</span>
        </h1>
        <div className="w-24 h-2 bg-brand-teal mx-auto mb-6 rounded-full" />
        <p className="text-zinc-600 font-medium text-lg lg:text-xl leading-snug">
          Pick a tool below — analyze your loan, learn the basics, or get smart suggestions. Everything in plain language, no jargon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl w-full">
        <ToolCard 
          icon="⚡"
          title="Loan Tenure"
          description="Visualize your loan journey and see how long it takes to finish your debt with interactive timelines."
          href="/simulator"
          isPremium={true}
        />
        <ToolCard 
          icon="📊"
          title="Loan Analyzer"
          description="Deep dive into your EMI components and understand your principal vs interest split."
          href="/loan-analyzer"
        />
        <ToolCard 
          icon="📖"
          title="Subamount Analyzer"
          description="Calculate exact savings from prepayments and find your path to becoming debt-free."
          href="/calculator"
        />
        <ToolCard 
          icon="📈"
          title="Doc Summarizer"
          description="Upload your loan agreement and get an instant AI summary of hidden terms and red flags."
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
