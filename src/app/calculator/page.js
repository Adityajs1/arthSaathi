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
    <div className="bg-white/50 backdrop-blur-sm border border-black/5 p-6 rounded-3xl flex items-center gap-4 transition-all hover:bg-white hover:shadow-lg">
      <span className="text-3xl">{icon}</span>
      <div>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</div>
        <div className={`text-xl font-black ${colorClass}`}>{value}</div>
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
    <div className="bg-[#f7f9f6] min-h-screen px-6 py-12 space-y-12 rounded-[3rem]">
      {/* Header Section */}
      <header className="bg-gradient-to-br from-[#1a6b7c] to-[#2d6a4f] p-12 rounded-[2.5rem] text-white shadow-xl">
        <div className="space-y-4 text-center md:text-left">
          <h1 className="text-4xl font-black">{t.subamountAnalyzer}</h1>
          <p className="text-white/70 max-w-md">{t.understandYourLoan}</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* INPUTS SIDEBAR */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-8">
            <h2 className="text-lg font-black border-b pb-4 text-zinc-400">{t.loanDetails}</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs font-black uppercase tracking-widest text-[#2a9db5]">{t.loanAmountLeft}</label>
                   <span className="font-black text-[#1a6b7c]">{fmtINR(loanAmount)}</span>
                </div>
                <input 
                  type="range" min="100000" max="10000000" step="50000" value={loanAmount} 
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#1a6b7c] h-2 bg-zinc-100 rounded-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs font-black uppercase tracking-widest text-[#2a9db5]">{t.interestRate}</label>
                   <span className="font-black text-[#1a6b7c]">{interestRate}% p.a.</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="0.1" value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#1a6b7c] h-2 bg-zinc-100 rounded-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                   <label className="text-xs font-black uppercase tracking-widest text-[#2a9db5]">{t.loanTime}</label>
                   <span className="font-black text-[#1a6b7c]">{tenureYears} {t.years}</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="1" value={tenureYears} 
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-[#1a6b7c] h-2 bg-zinc-100 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-8">
            <h2 className="text-lg font-black border-b pb-4 text-zinc-400">{t.extraPayment}</h2>
            
            <div className="flex bg-[#fdf6ec] p-2 rounded-2xl gap-2">
              <button 
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${extraType === 'monthly' ? 'bg-[#1a6b7c] text-white shadow-md' : 'text-[#1a6b7c]'}`}
                onClick={() => setExtraType('monthly')}
              >{t.monthly}</button>
              <button 
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${extraType === 'lump' ? 'bg-[#1a6b7c] text-white shadow-md' : 'text-[#1a6b7c]'}`}
                onClick={() => setExtraType('lump')}
              >{t.lumpSum}</button>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                 <label className="text-xs font-black uppercase tracking-widest text-[#4caf7d]">{extraType === 'monthly' ? t.monthlyExtra : t.lumpSumExtra}</label>
                 <span className="font-black text-[#2d6a4f]">{fmtINR(extraAmount)}</span>
              </div>
              <input 
                type="range" min="0" max={extraType === 'monthly' ? 100000 : 5000000} step={extraType === 'monthly' ? 500 : 50000} value={extraAmount} 
                onChange={(e) => setExtraAmount(Number(e.target.value))}
                className="w-full accent-[#2d6a4f] h-2 bg-zinc-100 rounded-full"
              />
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t.optGoal}</div>
              <div className="grid grid-cols-1 gap-4">
                <div 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${optMode === 'tenure' ? 'border-[#4caf7d] bg-[#e8f5ee]' : 'border-zinc-100'}`}
                  onClick={() => setOptMode('tenure')}
                >
                  <strong className="block text-sm">{t.reduceTime}</strong>
                  <span className="text-[10px] text-zinc-500">{t.finishEarlier}</span>
                </div>
                <div 
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${optMode === 'emi' ? 'border-[#4caf7d] bg-[#e8f5ee]' : 'border-zinc-100'}`}
                  onClick={() => setOptMode('emi')}
                >
                  <strong className="block text-sm">{t.reduceEmi}</strong>
                  <span className="text-[10px] text-zinc-500">{t.lowerMonthly}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RESULTS SECTION */}
        <main className="lg:col-span-7 space-y-10">
          <div className="bg-gradient-to-r from-[#1a6b7c] to-[#2d6a4f] p-10 rounded-[2.5rem] text-white text-center shadow-2xl">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-white/50">{t.yourEmi}</div>
             <div className="text-5xl font-black mb-4">{fmtINR(analysis.baseEMI)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard icon="💰" label={t.totalPayable} value={fmtINR(analysis.totalPayable)} />
            <MetricCard icon="🔥" label={t.interestYouPay} value={fmtINR(analysis.interestTotal)} colorClass="text-[#d94f3d]" />
            <MetricCard icon="✅" label={t.interestSaved} value={fmtINR(analysis.interestSaved)} colorClass="text-[#2d8a57]" />
            <MetricCard icon="⏳" label={t.timeSaved} value={fmtMonths(analysis.timeSavedMonths, lang)} colorClass="text-[#2d8a57]" />
          </div>

          <div className="space-y-6">
            <button 
              className="w-full p-6 rounded-3xl bg-white border border-black/5 font-black text-zinc-600 flex justify-between items-center hover:bg-zinc-50 transition-all shadow-sm"
              onClick={() => setShowSchedule(!showSchedule)}
            >
              <span>{showSchedule ? t.hideDetails : t.viewDetails}</span>
              <span className={`transition-transform duration-300 ${showSchedule ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {showSchedule && (
              <div className="bg-white rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-8 border-b border-black/5 font-black text-zinc-400 uppercase tracking-widest text-xs">{t.yearlySchedule}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#e0f5f9] text-[#1a6b7c] text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="p-6">{t.year}</th>
                        <th className="p-6">{t.totalPaid}</th>
                        <th className="p-6">{t.interestPaid}</th>
                        <th className="p-6">{t.principalPaid}</th>
                        <th className="p-6">{t.remainingLoan}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 font-bold text-zinc-600">
                      {analysis.schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-zinc-50 transition-all">
                          <td className="p-6 text-zinc-900">{row.year}</td>
                          <td className="p-6">{fmtINR(row.principal + row.sub + row.interest)}</td>
                          <td className={`p-6 ${row.interest / (row.principal + row.sub + row.interest) > 0.5 ? 'text-[#d94f3d]' : 'text-[#2d8a57]'}`}>
                            {fmtINR(row.interest)}
                          </td>
                          <td className="p-6">{fmtINR(row.principal + row.sub)}</td>
                          <td className="p-6 font-black text-[#1a6b7c]">{fmtINR(row.balance)}</td>
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
