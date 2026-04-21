'use strict';

export const bankRules = {
  "HDFC": {
    "specialCondition": "Prepayment allowed after 6 months. Minimum prepayment ₹25,000.",
    "penalty": "2% on outstanding principal if closed before 12 months."
  },
  "SBI": {
    "specialCondition": "No prepayment penalty on floating rate loans. Unlimited prepayments.",
    "penalty": "NIL"
  },
  "ICICI": {
    "specialCondition": "Part-prepayment allowed up to 25% of outstanding once a year.",
    "penalty": "3% if closed within 1 year."
  }
};

export function calculateEMI(P, r_annual, n_months, type = "Reducing Balance") {
  const r = r_annual / 12 / 100;
  if (type === "Flat Rate") {
    const totalInterest = P * (r_annual / 100) * (n_months / 12);
    return (P + totalInterest) / n_months;
  }
  // Standard Reducing Balance formula
  return (P * r * Math.pow(1 + r, n_months)) / (Math.pow(1 + r, n_months) - 1);
}

export function calculateOutstanding(P, r_annual, emi, n_total, n_paid, type = "Reducing Balance") {
  const r = r_annual / 12 / 100;
  let balance = P;
  for (let i = 0; i < n_paid; i++) {
    const interest = balance * r;
    const principal = emi - interest;
    balance = Math.max(0, balance - principal);
    if (balance <= 0) break;
  }
  return balance;
}

export function getStage(monthsPaid, totalMonths) {
  const progress = (monthsPaid / totalMonths) * 100;
  if (progress < 25) return { title: "Early Days", insight: "Focus on building a prepayment fund. Initial years are heavy on interest." };
  if (progress < 50) return { title: "Steady Growth", insight: "You've passed the initial interest peak. Every extra ₹1,000 now saves massive interest later." };
  if (progress < 75) return { title: "Final Stretch", insight: "Principal is shrinking fast. Consider closing it early if you have a lump sum." };
  return { title: "Almost There!", insight: "Congratulations! You're in the final lap. Check for any 'No Due' certificates." };
}

export function getPaymentSummary(snapshot, customEmi) {
  const { principal, annualRate, tenureMonths, emiType, monthsPaid } = snapshot;
  const r = annualRate / 12 / 100;
  const emi = customEmi;
  
  let balance = principal;
  let totalInterest = 0;
  let paidTillNow = 0;
  let interestPaidTillNow = 0;
  let principalPaidTillNow = 0;

  for (let i = 1; i <= tenureMonths; i++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    
    if (i <= monthsPaid) {
      interestPaidTillNow += interest;
      principalPaidTillNow += Math.min(principalPaid, balance);
      paidTillNow += emi;
    }
    
    totalInterest += interest;
    balance = Math.max(0, balance - principalPaid);
    if (balance <= 0) break;
  }

  return {
    totalInterestOverall: totalInterest,
    totalPayableOverall: principal + totalInterest,
    amountPaidTillNow: paidTillNow,
    interestPaidTillNow: interestPaidTillNow,
    principalPaidTillNow: principalPaidTillNow
  };
}

export function formatINR(n) {
  if (isNaN(n) || n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n);
}

// --- NEW ADVANCED SIMULATION LOGIC ---

export function generateSimulationSchedule(principal, annualRate, months, extraPayment = 0) {
  const r = annualRate / 100 / 12;
  const emi = calculateEMI(principal, annualRate, months);
  let balance = principal;
  const rows = [];

  for (let m = 1; m <= months * 2; m++) { // Allow overflow protection
    if (balance <= 0) break;

    const interestPaid = Number((balance * r).toFixed(2));
    let principalPaid = Number((emi - interestPaid).toFixed(2));
    
    // Ensure we don't pay more principal than balance
    if (principalPaid > balance) principalPaid = balance;
    
    // Prepayment handling
    let extra = extraPayment;
    if (extra > (balance - principalPaid)) {
        extra = Math.max(0, Number((balance - principalPaid).toFixed(2)));
    }

    balance = Number((balance - principalPaid - extra).toFixed(2));

    rows.push({
      Month: m,
      EMI: emi,
      Interest_Paid: interestPaid,
      Principal_Paid: principalPaid,
      Extra_Payment: extra,
      Total_Paid: Number((emi + extra).toFixed(2)),
      Balance: balance,
      Year: Math.ceil(m / 12)
    });

    if (balance <= 0) break;
  }

  return rows;
}

export function calculateYearlySummary(monthlyRows) {
  const yearlyMap = {};
  
  monthlyRows.forEach(row => {
    const yr = row.Year;
    if (!yearlyMap[yr]) {
      yearlyMap[yr] = { 
        Year: yr, 
        Total_EMI: 0, 
        Interest_Paid: 0, 
        Principal_Paid: 0, 
        Extra_Payment: 0, 
        Closing_Balance: 0 
      };
    }
    yearlyMap[yr].Total_EMI += row.EMI;
    yearlyMap[yr].Interest_Paid += row.Interest_Paid;
    yearlyMap[yr].Principal_Paid += row.Principal_Paid;
    yearlyMap[yr].Extra_Payment += row.Extra_Payment;
    yearlyMap[yr].Closing_Balance = row.Balance;
  });

  return Object.values(yearlyMap).map(yr => ({
    ...yr,
    Total_Paid: yr.Total_EMI + yr.Extra_Payment
  }));
}
