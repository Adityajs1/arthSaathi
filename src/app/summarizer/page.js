"use client";

import { useState } from "react";
import { analyzeAgreement, extractTextFromPdf } from "../actions";
import ReactMarkdown from "react-markdown";

function SubtopicResult({ title, content }) {
  if (!content) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-brand-teal uppercase tracking-widest border-b border-brand-teal/10 pb-2">{title}</h3>
      <div className="text-zinc-600 leading-relaxed text-sm md:text-base prose prose-sm max-w-none">
        {content}
      </div>
    </div>
  );
}

export default function Summarizer() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    setInputText("");
    setResult("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const text = await extractTextFromPdf(formData);
      if (text) {
        setInputText(text);
      }
    } catch (err) {
      alert("Error reading PDF. Please try pasting the text manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      alert("Please provide some text or upload a PDF first.");
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeAgreement({ inputText });
      setResult(analysis);
    } catch (err) {
      setResult("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 px-6 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-zinc text-white rounded-[2.5rem] p-10 md:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/20 to-transparent opacity-50" />
        <div className="relative z-10 space-y-4">
          <span className="bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-teal-soft">AI Legal Intelligence</span>
          <h1 className="text-4xl md:text-5xl font-black font-manrope leading-tight">📄 Loan Agreement Analyzer</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Upload your agreement or paste the text and our AI will find hidden red flags, risky terms, and unfair charges.
          </p>
        </div>
      </section>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* INPUT SECTION */}
        <section className="lg:col-span-12 space-y-8">
           <div className="premium-card">
              <div className="flex flex-col md:flex-row gap-8">
                {/* File Uploader */}
                <div className="flex-grow space-y-4">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Upload Document (PDF)</label>
                  <label className={`
                    w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${isExtracting ? 'border-brand-teal bg-brand-teal/5' : inputText ? 'border-green-400 bg-green-50' : 'border-zinc-100 hover:border-brand-teal hover:bg-zinc-50'}
                  `}>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isExtracting} />
                    <div className="text-center space-y-2 px-4">
                       <span className="text-4xl">
                         {isExtracting ? '⚙️' : inputText ? '✅' : '📁'}
                       </span>
                       <p className="font-bold text-zinc-600">
                         {isExtracting ? 'Analyzing PDF Content...' : inputText ? 'PDF Loaded Successfully' : 'Click to upload or drag & drop'}
                       </p>
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                         {inputText ? 'Ready for Analysis' : 'PDF Files only'}
                       </p>
                    </div>
                  </label>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-zinc-100" />

                {/* Text Input */}
                <div className="w-full space-y-4">
                   <label className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Agreement Text</label>
                   <textarea 
                      className="w-full h-48 bg-zinc-50 border border-zinc-100 rounded-3xl p-6 font-medium text-sm text-zinc-700 outline-none focus:ring-4 focus:ring-brand-teal/5 transition-all"
                      placeholder="Paste your legal text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                   />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                 <button 
                  className={`
                    px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl
                    ${isLoading ? 'bg-zinc-100 text-zinc-400' : 'bg-brand-teal text-white hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'}
                  `}
                  onClick={handleAnalyze} 
                  disabled={isLoading || isExtracting}
                 >
                   {isLoading ? "Summarizing Agreement..." : "Analyze Document Now →"}
                 </button>
              </div>
           </div>
        </section>

        {/* RESULTS SECTION */}
        {result && (
          <section className="lg:col-span-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="premium-card !p-12 space-y-12">
              <div className="flex items-center gap-4 border-b border-zinc-100 pb-8">
                 <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-black">!</div>
                 <div>
                    <h2 className="text-2xl font-black text-zinc-900">Analysis Result</h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Generated by Document AI Integration</p>
                 </div>
              </div>

              <div className="bg-brand-bg p-8 md:p-12 rounded-3xl border border-black/5 leading-relaxed text-zinc-700 shadow-inner prose prose-zinc prose-sm md:prose-base max-w-none">
                 <ReactMarkdown 
                   components={{
                     h2: ({node, ...props}) => <h2 className="text-xl font-black mt-8 mb-4 border-b pb-2 text-zinc-900" {...props} />,
                     h3: ({node, ...props}) => <h3 className="text-lg font-black mt-6 mb-3 text-brand-teal" {...props} />,
                     hr: ({node, ...props}) => <hr className="my-10 border-zinc-200" {...props} />,
                     ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-4" {...props} />,
                     p: ({node, ...props}) => <p className="mb-4 text-zinc-600 font-medium" {...props} />,
                   }}
                 >
                   {result}
                 </ReactMarkdown>
              </div>

              <div className="bg-amber-50 border-l-4 border-l-amber-400 p-6 rounded-2xl">
                 <p className="text-amber-800 text-sm font-bold leading-relaxed italic">
                   "Warning: Legal AI summaries are indicative. Please consult a professional before signing any contract that involves red flags."
                 </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
