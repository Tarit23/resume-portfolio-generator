"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { generatePortfolio } from "@/lib/api";
import { FileText, Palette, Rocket, CheckCircle2, Sparkles } from "lucide-react";

const THEMES = [
  { id: "premium", title: "Luminous Authority", desc: "Warm ambers and deep bronzes for executive presence.", gradient: "from-[#eeae01] to-[#907339]" },
  { id: "minimal", title: "Zen Minimal", desc: "Pure, elegant, and focused on content.", gradient: "from-gray-200 to-gray-400" },
  { id: "neon", title: "Cyber Neon", desc: "High-energy futuristic cyberpunk vibe.", gradient: "from-blue-500 to-purple-600" },
  { id: "dark", title: "Deep Space", desc: "Sophisticated dark mode for developers.", gradient: "from-slate-800 to-slate-950" },
];

export default function GeneratePortfolio() {
  const [theme, setTheme] = useState("premium");
  const [resume, setResume] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState("ARCHITECTING...");
  
  const router = useRouter(); 

  useEffect(() => {
    if (!isGenerating) return;
    const texts = ["Analyzing Resume...", "Extracting Skills...", "Structuring Professional Data...", "Applying Theme...", "Finalizing Portfolio..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return alert("Please upload your PDF resume.");
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append("theme", theme);
      formData.append("resume", resume);
      
      const response = await generatePortfolio(formData);
      router.push(response.redirectUrl);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Failed to generate portfolio";
      const errorDetails = error.response?.data?.details ? `\nDetails: ${error.response.data.details}` : "";
      alert(`${errorMsg}${errorDetails}\n\nMake sure the backend is running.`);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <main className="min-h-screen bg-[#fff8f3] text-[#201b11] flex flex-col items-center justify-center font-outfit">
        <div className="w-24 h-24 mb-10 relative">
          <div className="absolute inset-0 border-[6px] border-[#eeae01]/20 rounded-full" />
          <div className="absolute inset-0 border-[6px] border-[#eeae01] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="w-8 h-8 text-[#eeae01] animate-pulse" />
          </div>
        </div>
        <motion.h2 
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-3xl font-black text-[#201b11] mb-4"
        >
          {loadingText}
        </motion.h2>
        <p className="text-[#907339] font-medium">Please wait while our AI engine builds your digital presence.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8f3] text-[#201b11] relative overflow-x-hidden font-sans selection:bg-[#eeae01]/30">
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[#eeae01]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <header className="flex flex-col items-center text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none text-[#201b11]">
            Create Your <span className="text-[#eeae01]">Portfolio</span>
          </h1>
          <p className="text-lg text-[#504533] max-w-2xl font-medium">
            Just upload your PDF resume and pick a theme. We handle the rest.
          </p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-12">
          {/* Section 1: Resume */}
          <section className="bg-white border border-[#907339]/10 rounded-[40px] p-8 md:p-14 shadow-xl shadow-[#eeae01]/5">
            <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-[22px] bg-[#eeae01]/10 border border-[#eeae01]/20 flex items-center justify-center text-[#eeae01] shadow-lg shadow-[#eeae01]/5">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-[#201b11]">1. Upload Resume</h2>
                  <p className="text-sm text-[#7f7669] mt-1">We'll parse your skills, experience, and education automatically.</p>
                </div>
            </div>

            <div className="relative group">
              <input 
                type="file" 
                required
                accept=".pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all ${resume ? 'border-[#eeae01] bg-[#eeae01]/5' : 'border-[#907339]/20 bg-[#fff8f3] group-hover:bg-[#eeae01]/5 group-hover:border-[#eeae01]/40'}`}>
                <div className="mb-6 relative inline-flex">
                   <div className={`p-6 rounded-3xl ${resume ? 'bg-[#eeae01] text-white shadow-lg shadow-[#eeae01]/20' : 'bg-white border border-[#907339]/10 text-[#907339]'}`}>
                      <FileText className="w-12 h-12" />
                   </div>
                   {resume && <div className="absolute -top-2 -right-2 bg-black text-[#eeae01] rounded-full p-1.5 shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>}
                </div>
                <h3 className="text-xl font-black mb-2 text-[#201b11]">{resume ? resume.name : "Drag & Drop your PDF Resume"}</h3>
                <p className="text-[#907339] text-sm font-medium italic">Max 5MB</p>
              </div>
            </div>
          </section>

          {/* Section 2: Theme */}
          <section className="bg-white border border-[#907339]/10 rounded-[40px] p-8 md:p-14 shadow-xl shadow-[#eeae01]/5">
            <h3 className="text-2xl font-bold mb-10 flex items-center gap-4 text-[#201b11]">
              <Palette className="w-8 h-8 text-[#eeae01] p-1.5 rounded-lg bg-[#eeae01]/10" />
              2. Visual Foundation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {THEMES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-6 rounded-[32px] cursor-pointer border-2 transition-all duration-300 ${theme === t.id ? 'bg-[#eeae01]/5 border-[#eeae01] shadow-xl shadow-[#eeae01]/10' : 'bg-white border-[#907339]/10 hover:border-[#eeae01]/40'}`}
                >
                  <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br mb-6 ${t.gradient} shadow-inner shadow-black/10`} />
                  <h4 className="font-bold text-xl mb-2 text-[#201b11]">{t.title}</h4>
                  <p className="text-sm text-[#7f7669] leading-relaxed font-medium">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-10">
            <button 
              type="submit" 
              className="w-full bg-[#eeae01] hover:bg-[#d99f01] text-white font-black py-7 rounded-[32px] text-2xl transition-all shadow-2xl shadow-[#eeae01]/30 flex items-center justify-center gap-4 group active:scale-[0.98]"
            >
              GENERATE PORTFOLIO
              <Rocket className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
