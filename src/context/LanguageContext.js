"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/subamount-logic";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // Load language preference from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("arthsaathi_lang");
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem("arthsaathi_lang", newLang);
    }
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
