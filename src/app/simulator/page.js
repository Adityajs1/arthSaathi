"use client";

import { useState, useMemo } from "react";
import { 
  calculateEMI, 
  generateSimulationSchedule, 
  calculateYearlySummary, 
  formatINR 
} from "@/lib/loan-logic";
import { useLanguage } from "@/context/LanguageContext";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingDown, Zap, Calendar, Landmark, Percent, Clock, ChartBar, Layout
} from "lucide-react";

// Updated Theme Colors for Light Mode
const COLORS = {
  accent: "#0e8a6a", // brand-teal
  accentLight: "#dff6ef", // brand-teal-soft
  accentSecondary: "#10b981", // emerald-500
  accentTertiary: "#f59e0b", // amber-500
  accentQuaternary: "#f43f5e", // rose-500
  text: "#2f2418", // brand-zinc
  muted: "#735f49", // brand-zinc-muted
  grid: "#e5e7eb"
};

const CustomTooltip = ({ active, payload, label, prefix = "₹" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/5 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">{`Month ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-zinc-900 font-bold text-sm">
              {entry.name}: <span style={{ color: entry.color }}>{prefix}{entry.value.toLocaleString('en-IN')}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Simulator() {
  const { t } = useLanguage();
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [annualRate, setAnnualRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [extraPayment, setExtraPayment] = useState(0);
  const [viewMode, setViewMode] = useState("Monthly");

  const tenureMonths = tenureYears * 12;

  const { df_active, df_base, metrics, yearlySummary } = useMemo(() => {
    const active = generateSimulationSchedule(loanAmount, annualRate, tenureMonths, extraPayment);
    const base = generateSimulationSchedule(loanAmount, annualRate, tenureMonths, 0);
    
    const totalInterest = active.reduce((s, r) => s + r.Interest_Paid, 0);
    const totalPaid = active.reduce((s, r) => s + r.Total_Paid, 0);
    const baseInterest = base.reduce((s, r) => s + r.Interest_Paid, 0);

    return {
      df_active: active,
      df_base: base,
      yearlySummary: calculateYearlySummary(active),
      metrics: {
        emi: calculateEMI(loanAmount, annualRate, tenureMonths),
        totalInterest,
        totalPaid,
        interestRatio: (totalInterest / totalPaid) * 100,
        actualTenure: active.length,
        monthsSaved: base.length - active.length,
        interestSaved: baseInterest - totalInterest
      }
    };
  }, [loanAmount, annualRate, tenureMonths, extraPayment]);

  const pieData = [
    { name: t.principal, value: loanAmount, color: COLORS.accentSecondary },
    { name: t.interestYouPay, value: metrics.totalInterest, color: COLORS.accentQuaternary },
  ];

  return (
    <div className="space-y-12 px-6">
      {/* Header Hero */}
      <div className="hero-section">
        <div className="hero-overlay" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
          <div>
            <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-teal-soft">{t.advFinProjection}</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mt-4 mb-2">{t.loanSimulator}</h1>
            <p className="text-brand-teal-soft/80 text-lg font-medium">{t.simulatorDesc}</p>
            
            <div className="flex flex-wrap gap-3 mt-8">
               <span className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} /> EMI {formatINR(metrics.emi)}/mo
               </span>
               <span className={`bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2`}>
                 <TrendingDown size={14} /> {metrics.interestRatio.toFixed(1)}% {t.interestBurden}
               </span>
               {metrics.monthsSaved > 0 && (
                 <span className="bg-amber-400 text-brand-zinc px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                   <Clock size={14} /> {metrics.monthsSaved} {t.timeSaved}
                 </span>
               )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center min-w-[280px]">
            <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 block">{t.effectiveTenure}</span>
            <div className="text-4xl font-black text-white">{metrics.actualTenure} <span className="text-xl text-white/60">{t.monthly}</span></div>
            <p className="text-white/50 text-xs italic mt-2">{t.finishesInYear} {new Date().getFullYear() + Math.ceil(metrics.actualTenure/12)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar Inputs */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="premium-card space-y-8">
            <div className="flex items-center gap-3 border-b border-black/5 pb-4">
              <div className="w-8 h-8 rounded-full bg-brand-teal-soft flex items-center justify-center">
                <Layout size={16} className="text-brand-teal" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest">{t.parameters}</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="input-label mb-0 flex items-center gap-2"><Landmark size={12}/> {t.principal}</label>
                  <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="bg-transparent text-right font-black text-brand-teal outline-none w-24"
                  />
                </div>
                <input type="range" min="100000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="standard-slider" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="input-label mb-0 flex items-center gap-2"><Percent size={12}/> {t.rate}</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={annualRate} 
                      onChange={(e) => setAnnualRate(Number(e.target.value))}
                      className="bg-transparent text-right font-black text-brand-teal outline-none w-12"
                      step="0.1"
                    />
                    <span className="text-brand-teal font-black">%</span>
                  </div>
                </div>
                <input type="range" min="5" max="20" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="standard-slider" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="input-label mb-0 flex items-center gap-2"><Calendar size={12}/> {t.tenure}</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={tenureYears} 
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="bg-transparent text-right font-black text-brand-teal outline-none w-12"
                    />
                    <span className="text-brand-teal font-black">{t.years}</span>
                  </div>
                </div>
                <input type="range" min="1" max="30" step="1" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="standard-slider" />
              </div>

              <div className="pt-6 border-t border-black/5 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="input-label mb-0 text-amber-600 flex items-center gap-2 font-black"><Zap size={12}/> {t.extraPrepay}</label>
                  <input 
                    type="number" 
                    value={extraPayment} 
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                    className="bg-transparent text-right font-black text-amber-600 outline-none w-24"
                  />
                </div>
                <input type="range" min="0" max="200000" step="1000" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="standard-slider accent-amber-500" />
              </div>
            </div>
          </div>

          {/* Insights Cards */}
          <div className="space-y-4">
            <div className="bg-white border-l-4 border-brand-teal p-6 rounded-r-2xl shadow-sm">
               <p className="text-sm leading-relaxed text-zinc-600">
                 <span className="text-brand-teal font-black uppercase tracking-widest block mb-1 text-[10px]">{t.financialImpact}</span>
                 {t.prepayImpact(formatINR(extraPayment), formatINR(metrics.interestSaved), metrics.monthsSaved)}
               </p>
            </div>
            <div className="bg-white border-l-4 border-amber-500 p-6 rounded-r-2xl shadow-sm">
               <p className="text-sm leading-relaxed text-zinc-600">
                 <span className="text-amber-600 font-black uppercase tracking-widest block mb-1 text-[10px]">{t.strategicNote}</span>
                 {t.totalInterestNote(formatINR(metrics.totalInterest), ((metrics.totalInterest / loanAmount)*100).toFixed(1))}
               </p>
            </div>
          </div>
        </aside>

        {/* Main Charts Area */}
        <main className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
               <div className="metric-label">{t.totalPaid}</div>
               <div className="text-xl font-black">{formatINR(metrics.totalPaid)}</div>
             </div>
             <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
               <div className="metric-label">{t.interestPaid}</div>
               <div className="text-xl font-black text-rose-500">{formatINR(metrics.totalInterest)}</div>
             </div>
             <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
               <div className="metric-label">{t.interestSaved}</div>
               <div className="text-xl font-black text-emerald-600">{formatINR(metrics.interestSaved)}</div>
             </div>
             <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm">
               <div className="metric-label">{t.closingYear}</div>
               <div className="text-xl font-black">{new Date().getFullYear() + Math.ceil(metrics.actualTenure/12)}</div>
             </div>
          </div>

          {/* Balance Chart */}
          <div className="premium-card">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">{t.monthlyOutstanding}</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-brand-teal" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.active}</span>
                </div>
                {extraPayment > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-zinc-300 border-t border-dashed" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.baseline}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={df_active}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                  <XAxis dataKey="Month" stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v % 24 === 0 ? `M${v}` : ''} />
                  <YAxis stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  {extraPayment > 0 && (
                    <Line type="monotone" data={df_base} dataKey="Balance" stroke={COLORS.muted} strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  )}
                  <Area type="monotone" dataKey="Balance" name="Active Balance" stroke={COLORS.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Composition Donut */}
            <div className="premium-card">
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8">{t.loanComposition}</h3>
               <div className="h-[300px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={10} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatINR(v)} />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', paddingTop: '20px' }} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t.totalCost}</div>
                    <div className="text-xl font-black text-zinc-900">{formatINR(metrics.totalPaid)}</div>
                 </div>
               </div>
            </div>

            {/* Principal vs Interest Area */}
            <div className="premium-card">
               <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8">{t.pVsI}</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={df_active}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                      <XAxis dataKey="Month" stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Interest_Paid" name={t.interestPaid} stackId="1" stroke={COLORS.accentQuaternary} fill={COLORS.accentQuaternary} fillOpacity={0.1} dot={false} />
                      <Area type="monotone" dataKey="Principal_Paid" name={t.principal} stackId="1" stroke={COLORS.accentSecondary} fill={COLORS.accentSecondary} fillOpacity={0.1} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Schedule Table */}
      <div className="mt-12 space-y-6 pb-20">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase tracking-widest">{t.amortizationSchedule}</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">{t.detailedProjection}</p>
          </div>
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-black/5 shadow-inner">
            <button onClick={() => setViewMode("Monthly")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Monthly' ? 'bg-white text-brand-teal shadow-md' : 'text-zinc-500 hover:text-zinc-700'}`}>{t.monthly}</button>
            <button onClick={() => setViewMode("Yearly")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Yearly' ? 'bg-white text-brand-teal shadow-md' : 'text-zinc-500 hover:text-zinc-700'}`}>{t.lumpSum}</button>
          </div>
        </div>

        <div className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="data-table-header">
                  <th className="p-6">
                    {viewMode === "Monthly" ? t.monthly : t.year}
                  </th>
                  <th className="p-6">{t.totalPaid}</th>
                  <th className="p-6">{t.interestPaid}</th>
                  <th className="p-6">{t.principalPaid}</th>
                  <th className="p-6 text-amber-600">{t.prepayment}</th>
                  <th className="p-6">{t.balance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {(viewMode === "Monthly" ? df_active : yearlySummary).slice(0, 500).map((row, i) => (
                  <tr key={i} className="hover:bg-brand-teal-soft/20 transition-colors group">
                    <td className="data-table-cell text-zinc-900">
                      {viewMode === "Monthly" ? row.Month : row.Year}
                    </td>
                    <td className="data-table-cell">
                      {formatINR(viewMode === "Monthly" ? row.Total_Paid : row.Total_Paid)}
                    </td>
                    <td className="data-table-cell text-rose-500">
                      {formatINR(row.Interest_Paid)}
                    </td>
                    <td className="data-table-cell text-emerald-600">
                      {formatINR(row.Principal_Paid)}
                    </td>
                    <td className="data-table-cell font-black text-amber-600">
                      {formatINR(row.Extra_Payment)}
                    </td>
                    <td className="data-table-cell font-black text-brand-teal">
                      {formatINR(row.Balance || row.Closing_Balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
