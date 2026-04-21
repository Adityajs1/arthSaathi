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

export default function LoanAnalyzer() {
  const { setLoanSnapshot } = useLoan();
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
      <section className="bg-brand-teal text-white rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center justify-between shadow-2xl">
        <div className="max-w-xl space-y-6">
          <span className="text-brand-teal-soft font-black tracking-widest uppercase text-xs">ArthaSaathi Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-black font-manrope leading-tight">Simple money guidance for real loan decisions</h1>
          <p className="text-brand-teal-soft/80 text-lg leading-relaxed">
            Loan details bharo, sliders adjust karo, aur Hinglish mein poochho: "Agar main extra payment karu toh kya hoga?"
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2rem] text-center min-w-[280px]">
          <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 block">Estimated Monthly EMI</span>
          <div className="text-3xl font-black mb-1">{formatINR(Math.round(emi))}</div>
          <p className="text-white/50 text-sm italic">Live updates as you move sliders</p>
        </div>
      </section>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Sidebar */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="premium-card">
            <h2 className="text-xl font-black mb-8 border-b pb-4">Loan Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 block">Loan Amount</label>
                <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
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
                <div className="flex justify-between mb-3 text-xs font-black text-zinc-400 uppercase tracking-widest">
                  <span>Interest Rate</span>
                  <span className="text-brand-teal">{interestRate.toFixed(1)}%</span>
                </div>
                <input 
                  type="range" min="5" max="24" step="0.1" value={interestRate} 
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-brand-teal"
                />
              </div>

              <div>
                <div className="flex justify-between mb-3 text-xs font-black text-zinc-400 uppercase tracking-widest">
                  <span>Tenure</span>
                  <span className="text-brand-teal">{tenureYears} years</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="1" value={tenureYears} 
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-brand-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bank</label>
                  <select 
                    value={bankName} onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-bold text-sm"
                  >
                    <option>HDFC</option><option>SBI</option><option>ICICI</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Type</label>
                  <select 
                    value={loanType} onChange={(e) => setLoanType(e.target.value)}
                    className="w-full bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-bold text-sm"
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
          <div className="bg-brand-zinc text-white p-8 rounded-[2rem] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1 block">Total Cost of Loan</span>
              <div className="text-3xl font-black">{formatINR(Math.round(paymentSummary.totalPayableOverall))}</div>
            </div>
            <div className="text-right">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">{stage.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card !p-6 flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-zinc-400 uppercase mb-2">Paid Till Now</span>
              <strong className="text-xl font-black">{formatINR(Math.round(paymentSummary.amountPaidTillNow))}</strong>
            </div>
            <div className="premium-card !p-6 flex flex-col items-center text-center border-l-4 border-l-orange-400">
              <span className="text-[10px] font-black text-zinc-400 uppercase mb-2">Interest Paid</span>
              <strong className="text-xl font-black text-orange-600">{formatINR(Math.round(paymentSummary.interestPaidTillNow))}</strong>
            </div>
            <div className="premium-card !p-6 flex flex-col items-center text-center border-l-4 border-l-brand-teal">
              <span className="text-[10px] font-black text-zinc-400 uppercase mb-2">Principal Paid</span>
              <strong className="text-xl font-black text-brand-teal">{formatINR(Math.round(paymentSummary.principalPaidTillNow))}</strong>
            </div>
          </div>

          <div className="premium-card">
            <h3 className="font-black mb-4">Advisor Insights</h3>
            <p className="text-zinc-500 text-sm leading-relaxed italic">
              "{stage.insight} Bank interest rules for {bankName} suggests tracking your prepayments every 6 months to maximize savings."
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
