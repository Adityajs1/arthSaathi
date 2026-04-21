"use client";

import { useState, useMemo } from "react";
import { 
  calculateEMI, 
  generateSimulationSchedule, 
  calculateYearlySummary, 
  formatINR 
} from "@/lib/loan-logic";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingDown, ShieldCheck, Zap, Info, Calendar, Download, RefreshCcw, Landmark, Percent, Clock
} from "lucide-react";

// Dashboard Theme Colors
const COLORS = {
  bg: "#0a0e1a",
  surface: "#111827",
  card: "#141d2e",
  border: "#1e2d45",
  accent: "#38bdf8",
  accent2: "#34d399",
  accent3: "#f59e0b",
  accent4: "#f87171",
  text: "#e2e8f0",
  muted: "#64748b"
};

const CustomTooltip = ({ active, payload, label, prefix = "₹" }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827] border border-[#1e2d45] p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[#64748b] text-[10px] font-black uppercase tracking-widest mb-2">{`Month ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-white font-bold text-sm">
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
    { name: 'Principal', value: loanAmount, color: COLORS.accent2 },
    { name: 'Interest', value: metrics.totalInterest, color: COLORS.accent4 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0] font-mono p-4 md:p-8 selection:bg-sky-500/30">
      {/* Header Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#0d1829] border border-[#1e2d45] rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Loan <span className="text-sky-400">Simulator</span></h1>
            <p className="text-[#64748b] text-sm tracking-wide">Advanced Financial Projection Dashboard v1.0</p>
            <div className="flex flex-wrap gap-3 mt-6">
               <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Zap size={12} /> EMI {formatINR(metrics.emi)}/mo
               </span>
               <span className={`border px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${metrics.interestRatio < 40 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                 <TrendingDown size={12} /> {metrics.interestRatio.toFixed(1)}% Interest Burden
               </span>
               {metrics.monthsSaved > 0 && (
                 <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Clock size={12} /> {metrics.monthsSaved} Months Saved
                 </span>
               )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Effective Tenure</div>
            <div className="text-4xl font-black text-white">{metrics.actualTenure} <span className="text-xl text-[#64748b]">Months</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141d2e] border border-[#1e2d45] rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-3 border-b border-[#1e2d45] pb-4">
              <RefreshCcw size={18} className="text-sky-400" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Parameters</h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2"><Landmark size={12}/> Principal</label>
                  <span className="text-sky-400 font-black">{formatINR(loanAmount)}</span>
                </div>
                <input type="range" min="100000" max="50000000" step="100000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2"><Percent size={12}/> Rate</label>
                  <span className="text-sky-400 font-black">{annualRate}%</span>
                </div>
                <input type="range" min="5" max="20" step="0.1" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#64748b] uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Tenure</label>
                  <span className="text-sky-400 font-black">{tenureYears} Yrs</span>
                </div>
                <input type="range" min="1" max="30" step="1" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div className="pt-6 border-t border-[#1e2d45] space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><Zap size={12}/> Extra Prepay</label>
                  <span className="text-amber-400 font-black">{formatINR(extraPayment)}/mo</span>
                </div>
                <input type="range" min="0" max="200000" step="1000" value={extraPayment} onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full accent-amber-400" />
              </div>
            </div>
          </div>

          {/* Insights Cards */}
          <div className="space-y-4">
            <div className="bg-[#141d2e] border-l-4 border-emerald-400 p-6 rounded-r-2xl">
               <p className="text-xs leading-relaxed text-[#e2e8f0]">
                 <span className="text-emerald-400 font-black uppercase tracking-widest block mb-1 text-[10px]">Financial Impact</span>
                 Prepaying {formatINR(extraPayment)} saves <span className="text-emerald-400 font-black">{formatINR(metrics.interestSaved)}</span> in interest and closes loan <span className="text-emerald-400 font-black">{metrics.monthsSaved} months</span> earlier.
               </p>
            </div>
            <div className="bg-[#141d2e] border-l-4 border-amber-400 p-6 rounded-r-2xl">
               <p className="text-xs leading-relaxed text-[#e2e8f0]">
                 <span className="text-amber-400 font-black uppercase tracking-widest block mb-1 text-[10px]">Strategic Note</span>
                 You will pay {formatINR(metrics.totalInterest)} as total interest. This is {((metrics.totalInterest / loanAmount)*100).toFixed(1)}% of your principal.
               </p>
            </div>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-[#141d2e] border border-[#1e2d45] p-5 rounded-2xl">
               <div className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.15em] mb-2">Total Paid</div>
               <div className="text-xl font-black">{formatINR(metrics.totalPaid)}</div>
             </div>
             <div className="bg-[#141d2e] border border-[#1e2d45] p-5 rounded-2xl">
               <div className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.15em] mb-2">Interest Paid</div>
               <div className="text-xl font-black text-rose-400">{formatINR(metrics.totalInterest)}</div>
             </div>
             <div className="bg-[#141d2e] border border-[#1e2d45] p-5 rounded-2xl">
               <div className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.15em] mb-2">Interest Saved</div>
               <div className="text-xl font-black text-emerald-400">{formatINR(metrics.interestSaved)}</div>
             </div>
             <div className="bg-[#141d2e] border border-[#1e2d45] p-5 rounded-2xl">
               <div className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.15em] mb-2">Closing Year</div>
               <div className="text-xl font-black">{new Date().getFullYear() + Math.ceil(metrics.actualTenure/12)}</div>
             </div>
          </div>

          {/* Balance Chart */}
          <div className="bg-[#141d2e] border border-[#1e2d45] p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b]">Monthly Outstanding Balance</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-sky-400" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest">Active</span>
                </div>
                {extraPayment > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-[#64748b] border-t border-dashed" />
                    <span className="text-[9px] font-bold text-[#64748b] uppercase tracking-widest">Baseline</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={df_active}>
                  <defs>
                    <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                  <XAxis dataKey="Month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v % 24 === 0 ? `M${v}` : ''} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip content={<CustomTooltip />} />
                  {extraPayment > 0 && (
                    <Line type="monotone" data={df_base} dataKey="Balance" stroke="#64748b" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                  )}
                  <Area type="monotone" dataKey="Balance" name="Active Balance" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Composition Donut */}
            <div className="bg-[#141d2e] border border-[#1e2d45] p-6 rounded-3xl">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b] mb-6">Loan Composition</h3>
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
                    <div className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Total Cost</div>
                    <div className="text-xl font-black text-white">{formatINR(metrics.totalPaid)}</div>
                 </div>
               </div>
            </div>

            {/* Principal vs Interest Area */}
            <div className="bg-[#141d2e] border border-[#1e2d45] p-6 rounded-3xl">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b] mb-6">P vs I per Month</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={df_active}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" vertical={false} />
                      <XAxis dataKey="Month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Interest_Paid" name="Interest" stackId="1" stroke="#f87171" fill="#f87171" fillOpacity={0.1} dot={false} />
                      <Area type="monotone" dataKey="Principal_Paid" name="Principal" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.1} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="mt-12 space-y-6">
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Amortization Schedule</h2>
            <p className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest mt-1">Detailed month-by-month projection</p>
          </div>
          <div className="flex bg-[#141d2e] p-1.5 rounded-xl border border-[#1e2d45]">
            <button onClick={() => setViewMode("Monthly")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Monthly' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-[#64748b] hover:text-white'}`}>Monthly</button>
            <button onClick={() => setViewMode("Yearly")} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'Yearly' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-[#64748b] hover:text-white'}`}>Yearly</button>
          </div>
        </div>

        <div className="bg-[#141d2e] border border-[#1e2d45] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111827] border-b border-[#1e2d45]">
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest">
                    {viewMode === "Monthly" ? "Month" : "Year"}
                  </th>
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Total Paid</th>
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Interest</th>
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest">Principal</th>
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-amber-400">Prepayment</th>
                  <th className="p-6 text-[10px] font-black text-[#64748b] uppercase tracking-widest text-sky-400">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2d45]">
                {(viewMode === "Monthly" ? df_active : yearlySummary).slice(0, 500).map((row, i) => (
                  <tr key={i} className="hover:bg-sky-500/[0.02] transition-colors group">
                    <td className="p-6 text-sm font-bold text-white">
                      {viewMode === "Monthly" ? row.Month : row.Year}
                    </td>
                    <td className="p-6 text-sm font-medium text-[#e2e8f0]">
                      {formatINR(viewMode === "Monthly" ? row.Total_Paid : row.Total_Paid)}
                    </td>
                    <td className="p-6 text-sm font-medium text-rose-400/80">
                      {formatINR(row.Interest_Paid)}
                    </td>
                    <td className="p-6 text-sm font-medium text-emerald-400/80">
                      {formatINR(row.Principal_Paid)}
                    </td>
                    <td className="p-6 text-sm font-black text-amber-400/80">
                      {formatINR(row.Extra_Payment)}
                    </td>
                    <td className="p-6 text-sm font-black text-sky-400">
                      {formatINR(row.Balance || row.Closing_Balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] pb-12">
        ARTHSAATHI FINANCIAL TERMINAL · 2026 · NEXT.JS 15
      </div>
    </div>
  );
}
