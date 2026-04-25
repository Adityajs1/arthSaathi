"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { 
  fmtINR, 
  fmtMonths, 
  amortize, 
  yearBuckets 
} from "@/lib/subamount-logic";

function MetricCard({ icon, label, value, colorClass = "" }) {
  return (
    <div className="metric-card">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="metric-label">{label}</div>
        <div className={`metric-value ${colorClass}`}>{value}</div>
      </div>
    </div>
  );
}

export default function Calculator() {
  const { lang, t } = useLanguage();

  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [extraAmount, setExtraAmount] = useState(0);
  const [extraType, setExtraType] = useState("monthly");
  const [optMode, setOptMode] = useState("tenure");
  const [showSchedule, setShowSchedule] = useState(false);

  const analysis = useMemo(() => {
    if (!loanAmount || !interestRate || !tenureYears) return null;
    const months = tenureYears * 12;
    const base = amortize(loanAmount, interestRate, months, 0, 'none', 'tenure');
    const baseTI = base.rows.reduce((s, v) => s + v.interest, 0);
    const opt = amortize(loanAmount, interestRate, months, extraAmount, extraType, optMode);
    const optTI = opt.rows.reduce((s, v) => s + v.interest, 0);
    return {
      baseEMI: base.baseEMI,
      totalPayable: loanAmount + baseTI,
      interestTotal: baseTI,
      interestSaved: Math.max(0, baseTI - optTI),
      timeSavedMonths: Math.max(0, base.rows.length - opt.rows.length),
      schedule: yearBuckets(opt.rows)
    };
  }, [loanAmount, interestRate, tenureYears, extraAmount, extraType, optMode]);

  return (
    <div className="space-y-12 px-6">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay" />
        <div className="relative z-10 space-y-4 text-center md:text-left">
          <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-teal-soft">Subamount Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-black font-manrope leading-tight">{t.subamountAnalyzer}</h1>
          <p className="text-brand-teal-soft/80 text-lg max-w-md leading-relaxed">{t.understandYourLoan}</p>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center min-w-[280px]">
          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 block">{t.yourEmi}</span>
          <div className="text-4xl font-black mb-1">{fmtINR(analysis.baseEMI)}</div>
          <p className="text-white/50 text-xs italic">Live updates as you move sliders</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* INPUTS SIDEBAR */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="premium-card space-y-8">
            <h2 className="text-xl font-black border-b pb-4">{t.loanDetails}</h2>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="input-label mb-0">{t.loanAmountLeft}</label>
                   <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="bg-transparent text-right font-black text-brand-teal outline-none w-24"
                   />
                </div>
                <input 
                  type="range" min="100000" max="10000000" step="50000" value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="standard-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="input-label mb-0">{t.interestRate}</label>
                   <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={interestRate} 
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="bg-transparent text-right font-black text-brand-teal outline-none w-12"
                      step="0.1"
                    />
                    <span className="font-black text-brand-teal">% p.a.</span>
                   </div>
                </div>
                <input 
                  type="range" min="1" max="30" step="0.1" value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="standard-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="input-label mb-0">{t.loanTime}</label>
                   <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={tenureYears} 
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="bg-transparent text-right font-black text-brand-teal outline-none w-12"
                    />
                    <span className="font-black text-brand-teal">{t.years}</span>
                   </div>
                </div>
                <input 
                  type="range" min="1" max="30" step="1" value={tenureYears} 
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="standard-slider"
                />
              </div>
            </div>
          </div>

          <div className="premium-card space-y-8">
            <h2 className="text-xl font-black border-b pb-4">{t.extraPayment}</h2>
            
            <div className="flex bg-zinc-50 p-2 rounded-2xl gap-2 border border-black/5">
              <button 
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${extraType === 'monthly' ? 'bg-brand-teal text-white shadow-md' : 'text-zinc-500'}`}
                onClick={() => setExtraType('monthly')}
              >{t.monthly}</button>
              <button 
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${extraType === 'lump' ? 'bg-brand-teal text-white shadow-md' : 'text-zinc-500'}`}
                onClick={() => setExtraType('lump')}
              >{t.lumpSum}</button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                 <label className="input-label mb-0">{extraType === 'monthly' ? t.monthlyExtra : t.lumpSumExtra}</label>
                 <input 
                  type="number" 
                  value={extraAmount} 
                  onChange={(e) => setExtraAmount(Number(e.target.value))}
                  className="bg-transparent text-right font-black text-brand-teal outline-none w-24"
                 />
              </div>
              <input 
                type="range" min="0" max={extraType === 'monthly' ? 100000 : 5000000} step={extraType === 'monthly' ? 500 : 50000} value={extraAmount} 
                onChange={(e) => setExtraAmount(Number(e.target.value))}
                className="standard-slider"
              />
            </div>

            <div className="space-y-4">
              <div className="input-label">{t.optGoal}</div>
              <div className="grid grid-cols-1 gap-4">
                <div 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${optMode === 'tenure' ? 'border-brand-teal bg-brand-teal-soft/30' : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'}`}
                  onClick={() => setOptMode('tenure')}
                >
                  <strong className="block text-sm">{t.reduceTime}</strong>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{t.finishEarlier}</span>
                </div>
                <div 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${optMode === 'emi' ? 'border-brand-teal bg-brand-teal-soft/30' : 'border-zinc-100 bg-zinc-50 hover:bg-zinc-100'}`}
                  onClick={() => setOptMode('emi')}
                >
                  <strong className="block text-sm">{t.reduceEmi}</strong>
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{t.lowerMonthly}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS SECTION */}
        <main className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-brand-teal to-brand-teal-deep text-white p-8 rounded-[var(--radius-premium)] shadow-xl shadow-brand-teal/20 flex items-center justify-between overflow-hidden relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 block">{t.totalPayable}</span>
              <div className="text-3xl font-black">{fmtINR(analysis.totalPayable)}</div>
            </div>
            <div className="relative z-10 text-right">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Projection Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard icon="🔥" label={t.interestYouPay} value={fmtINR(analysis.interestTotal)} colorClass="text-rose-500" />
            <MetricCard icon="✅" label={t.interestSaved} value={fmtINR(analysis.interestSaved)} colorClass="text-brand-teal" />
            <MetricCard icon="⏳" label={t.timeSaved} value={fmtMonths(analysis.timeSavedMonths, lang)} colorClass="text-brand-teal" />
            <MetricCard icon="💰" label="Base EMI" value={fmtINR(analysis.baseEMI)} />
          </div>

          <div className="space-y-6">
            <button 
              className="w-full p-6 rounded-[2rem] bg-white border border-black/5 font-black text-zinc-600 flex justify-between items-center hover:bg-zinc-50 transition-all shadow-sm group"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs group-hover:bg-brand-teal-soft transition-colors">📅</span>
                {showSchedule ? t.hideDetails : t.viewDetails}
              </span>
              <span className={`transition-transform duration-300 ${showSchedule ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showSchedule && (
              <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-8 border-b border-black/5 font-black text-zinc-400 uppercase tracking-widest text-xs">{t.yearlySchedule}</div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead className="data-table-header">
                      <tr>
                        <th className="p-6">{t.year}</th>
                        <th className="p-6">{t.totalPaid}</th>
                        <th className="p-6">{t.interestPaid}</th>
                        <th className="p-6">{t.principalPaid}</th>
                        <th className="p-6">{t.remainingLoan}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {analysis.schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-zinc-50 transition-all">
                          <td className="data-table-cell text-zinc-900">{row.year}</td>
                          <td className="data-table-cell">{fmtINR(row.principal + row.sub + row.interest)}</td>
                          <td className={`data-table-cell ${row.interest / (row.principal + row.sub + row.interest) > 0.5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {fmtINR(row.interest)}
                          </td>
                          <td className="data-table-cell">{fmtINR(row.principal + row.sub)}</td>
                          <td className="data-table-cell font-black text-brand-teal">{fmtINR(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <footer className="pt-12 text-center text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
        {t.footerNote}
      </footer>
    </div>
  );
}
