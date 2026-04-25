"use client";

import { useState, useEffect } from "react";
import { 
  calculateEMI, 
  calculateOutstanding, 
  getStage, 
  getPaymentSummary, 
  formatINR 
} from "@/lib/loan-logic";
import { useLoan } from "@/context/LoanContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoanAnalyzer() {
  const { setLoanSnapshot } = useLoan();
  const { t } = useLanguage();
  const [loanAmount, setLoanAmount] = useState(2500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);
  const [bankName, setBankName] = useState("HDFC");
  const [loanType, setLoanType] = useState("Home Loan");
  const [interestType, setInterestType] = useState("Fixed");
  const [emiType, setEmiType] = useState("Reducing Balance");
  const [currentEmi, setCurrentEmi] = useState("");
  const [loanAgeMonths, setLoanAgeMonths] = useState(24);

  const tenureMonths = tenureYears * 12;
  const calculatedEmi = calculateEMI(loanAmount, interestRate, tenureMonths, emiType);
  const emi = currentEmi !== "" ? Number(currentEmi) : calculatedEmi;
  const outstanding = calculateOutstanding(loanAmount, interestRate, emi, tenureMonths, loanAgeMonths, emiType);
  const stage = getStage(loanAgeMonths, tenureMonths);
  const paymentSummary = getPaymentSummary({ 
    principal: loanAmount, 
    annualRate: interestRate, 
    tenureYears, 
    tenureMonths, 
    emiType, 
    monthsPaid: loanAgeMonths 
  }, emi);

  // Sync with global context for ChatBot
  useEffect(() => {
    setLoanSnapshot({
      principal: loanAmount,
      annualRate: interestRate,
      tenureYears,
      tenureMonths,
      bankName,
      loanType,
      interestType,
      emiType,
      monthsPaid: loanAgeMonths,
      emi,
      outstanding
    });

    // Cleanup when leaving page
    return () => setLoanSnapshot(null);
  }, [loanAmount, interestRate, tenureYears, bankName, loanType, interestType, emiType, loanAgeMonths, emi, outstanding, setLoanSnapshot]);

  return (
    <div className="space-y-12 px-6">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="relative z-10 max-w-xl space-y-6">
          <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-teal-soft">ArthaSaathi Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-black font-manrope leading-tight">{t.simpleGuidance}</h1>
          <p className="text-brand-teal-soft/80 text-lg leading-relaxed">
            {t.loanDetailsBhar}
          </p>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center min-w-[280px]">
          <span className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2 block">{t.estimatedEmi}</span>
          <div className="text-4xl font-black mb-1">{formatINR(Math.round(emi))}</div>
          <p className="text-white/50 text-xs italic">Live updates as you move sliders</p>
        </div>
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="premium-card space-y-8">
            <h2 className="text-xl font-black border-b pb-4">{t.loanDetails}</h2>
            
            <div className="space-y-8">
              <div>
                <label className="input-label">{t.principal}</label>
                <div className="input-container">
                  <span className="text-zinc-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={loanAmount} 
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="bg-transparent font-black text-lg outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <label className="input-label mb-0">{t.interestRate}</label>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      value={interestRate} 
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="bg-transparent text-right font-black text-brand-teal outline-none w-12"
                      step="0.1"
                    />
                    <span className="text-brand-teal font-black">%</span>
                  </div>
                </div>
                <input 
                  type="range" min="5" max="24" step="0.1" value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="standard-slider"
                />
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <label className="input-label mb-0">{t.tenure}</label>
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
                <input 
                  type="range" min="1" max="30" step="1" value={tenureYears} 
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="standard-slider"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="input-label">{t.bank}</label>
                  <select 
                    value={bankName} onChange={(e) => setBankName(e.target.value)}
                    className="standard-select"
                  >
                    <option>HDFC</option><option>SBI</option><option>ICICI</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="input-label">{t.type}</label>
                  <select 
                    value={loanType} onChange={(e) => setLoanType(e.target.value)}
                    className="standard-select"
                  >
                    <option>Home Loan</option><option>Personal Loan</option><option>Car Loan</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right: Insights Grid */}
        <main className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-brand-teal to-brand-teal-deep text-white p-8 rounded-[var(--radius-premium)] shadow-xl shadow-brand-teal/20 flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="relative z-10">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 block">{t.totalCostLoan}</span>
              <div className="text-3xl font-black">{formatINR(Math.round(paymentSummary.totalPayableOverall))}</div>
            </div>
            <div className="relative z-10 text-right">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{stage.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="metric-card !flex-col !items-center !text-center">
              <span className="metric-label">{t.paidTillNow}</span>
              <strong className="metric-value">{formatINR(Math.round(paymentSummary.amountPaidTillNow))}</strong>
            </div>
            <div className="metric-card !flex-col !items-center !text-center border-b-4 border-b-rose-500">
              <span className="metric-label">{t.interestPaid}</span>
              <strong className="metric-value text-rose-500">{formatINR(Math.round(paymentSummary.interestPaidTillNow))}</strong>
            </div>
            <div className="metric-card !flex-col !items-center !text-center border-b-4 border-b-brand-teal">
              <span className="metric-label">{t.principalPaid}</span>
              <strong className="metric-value text-brand-teal">{formatINR(Math.round(paymentSummary.principalPaidTillNow))}</strong>
            </div>
          </div>

          <div className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-teal-soft flex items-center justify-center text-brand-teal font-black text-xs">i</div>
              <h3 className="font-black">{t.advisorInsights}</h3>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed italic">
              "{stage.insight} Bank interest rules for {bankName} suggests tracking your prepayments every 6 months to maximize savings."
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
