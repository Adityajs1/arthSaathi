"use client";
import { useState, useRef, useEffect } from "react";
import { generateChatResponse } from "../../actions";
import { formatINR, bankRules } from "@/lib/loan-logic";
import { useLanguage } from "@/context/LanguageContext";
import { useLoan } from "@/context/LoanContext";

export default function ChatBot() {
  const { lang } = useLanguage();
  const { loanSnapshot } = useLoan();
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: lang === "hi" ? "नमस्ते, मैं अर्थसाथी हूँ। मैं आपकी कैसे मदद कर सकता हूँ?" : 
               lang === "hinglish" ? "Namaste, main ArthSaathi hoon. Main aapki kaise help kar sakta hoon?" :
               "Hello, I am ArthSaathi. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textOverride) => {
    const text = textOverride || inputValue.trim();
    if (!text || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const loanContext = loanSnapshot ? `
        Loan Amount: ${formatINR(loanSnapshot.principal)}
        Interest Rate: ${loanSnapshot.annualRate}%
        Tenure: ${loanSnapshot.tenureYears} years
        Bank: ${loanSnapshot.bankName}
        Left to Pay: ${formatINR(loanSnapshot.outstanding)}
      ` : "No specific loan context provided.";

      const response = await generateChatResponse({
        systemPrompt: "You are ArthSaathi — a trusted, friendly Indian financial advisor who speaks in natural Hinglish. Keep responses concise and practical. Use bullet points for lists.",
        loanContext,
        userQuery: text,
        conversationHistory: messages.slice(-5),
        adaptationInstruction: text.toLowerCase().includes("simple") ? "Explain even simpler." : "",
        calculationContext: loanSnapshot ? `Bank rules for ${loanSnapshot.bankName}: ${bankRules[loanSnapshot.bankName].specialCondition}` : ""
      });

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, connection mein dikkat hai. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      {/* Toggle Button - Rounded Bubble */}
      <button 
        className={`w-16 h-16 bg-brand-teal text-white rounded-full shadow-2xl flex items-center justify-center text-3xl transition-all duration-500 hover:scale-110 hover:shadow-brand-teal/40 active:scale-95 ${isOpen ? 'scale-0 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'}`}
        onClick={() => setIsOpen(true)}
      >
        💬
      </button>

      {/* Chat Window */}
      <section 
        className={`fixed bottom-8 right-8 w-[90vw] md:w-[400px] h-[75vh] max-h-[650px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-black/5 flex flex-col overflow-hidden transition-all duration-500 transform origin-bottom-right ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-brand-teal p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">✨</div>
            <div>
              <h2 className="text-white m-0 text-lg font-black leading-tight">ArthSaathi AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/70 text-[10px] font-black uppercase tracking-widest">Always Active</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-grow p-6 space-y-6 overflow-y-auto bg-zinc-50/50 no-scrollbar" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                msg.role === "assistant" 
                ? "bg-white border border-black/5 text-zinc-700 rounded-tl-none" 
                : "bg-brand-teal text-white rounded-tr-none"
              }`}>
                {msg.role === "assistant" && (
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-teal mb-2">ArthSaathi Agent</div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-black/5 p-5 rounded-3xl rounded-tl-none shadow-sm flex gap-1.5">
                <span className="w-2 h-2 bg-brand-teal/20 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-brand-teal/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-brand-teal rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 bg-white border-t border-black/5 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["EMI Status?", "How to save?", "Prepayment advice?"].map(hint => (
              <button 
                key={hint}
                className="whitespace-nowrap px-4 py-2 bg-zinc-50 border border-black/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:border-brand-teal hover:text-brand-teal transition-all"
                onClick={() => handleSend(hint)}
              >
                {hint}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything about loans..."
              className="flex-grow bg-zinc-50 border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-teal/5 transition-all"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button 
              className="bg-brand-teal text-white p-4 rounded-2xl shadow-xl hover:shadow-brand-teal/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
              onClick={() => handleSend()} 
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
