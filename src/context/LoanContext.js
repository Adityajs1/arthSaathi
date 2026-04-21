"use client";

import React, { createContext, useContext, useState } from "react";

const LoanContext = createContext();

export function LoanProvider({ children }) {
  const [loanSnapshot, setLoanSnapshot] = useState(null);

  return (
    <LoanContext.Provider value={{ loanSnapshot, setLoanSnapshot }}>
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  return context;
}
