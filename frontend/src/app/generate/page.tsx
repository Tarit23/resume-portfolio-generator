"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { useRouter } from "next/navigation";
import { generatePortfolio } from "@/lib/api";
import { User, Palette, CloudUpload, FileText, Sparkles, Rocket, Info, CheckCircle2 } from "lucide-react";

const THEMES = [
  { id: "premium", title: "Premium Amber", desc: "Centered, bold, and high-contrast gold aesthetic.", gradient: "from-[#F59E0B] to-[#78350F]" },
  { id: "minimal", title: "Zen Minimal", desc: "Pure, elegant, and focused on content.", gradient: "from-gray-200 to-gray-400" },
  { id: "neon", title: "Cyber Neon", desc: "High-energy futuristic cyberpunk vibe.", gradient: "from-blue-500 to-purple-600" },
  { id: "dark", title: "Deep Space", desc: "Sophisticated dark mode for developers.", gradient: "from-slate-800 to-slate-950" },
];

export default function GeneratePortfolio() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("premium");
  const [resume, setResume] = useState<File | null>(null);
  const [workFiles, setWorkFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const router = useRouter(); 

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !resume) return alert("Please fill required fields");
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("theme", theme);
      formData.append("resume", resume);
      
      workFiles.forEach((file) => {
        formData.append("workFiles", file);
      });

      await generatePortfolio(formData);
      router.push(`/${username}`);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Failed to generate portfolio";
      const errorDetails = error.response?.data?.details ? `\nDetails: ${error.response.data.details}` : "";
      alert(`${errorMsg}${errorDetails}\n\nMake sure the backend is running.`);
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-blue-900/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <header className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-blue-400 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI PORTFOLIO ARCHITECT <span className="opacity-40">v1.1.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none"
          >
            Design Your <span className="text-gradient">Professional</span> Future.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl font-medium"
          >
            Upload your credentials and let our AI engine orchestrate a world-class digital presence for you in seconds.
          </motion.p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Section 1: Identity */}
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">1. Personal Identity</h2>
                <p className="text-sm text-gray-500">How you'll be represented online.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all" 
                    placeholder="e.g. Alexander Pierce"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-all" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Universal Handle</label>
                <div className="relative group flex items-center">
                  <div className="absolute left-6 text-gray-500 font-medium select-none pointer-events-none">folio.me/</div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-[90px] pr-6 py-4 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all font-medium" 
                    placeholder="username"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/0 group-focus-within:border-blue-500/20 pointer-events-none transition-all" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Resume */}
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">2. The Blueprint</h2>
                  <p className="text-sm text-gray-500">Your professional history and skills.</p>
                </div>
            </div>

            <div className="relative group">
              <input 
                type="file" 
                required
                accept=".pdf,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all ${resume ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-white/20'}`}>
                <div className="mb-6 relative inline-flex">
                   <div className={`p-5 rounded-3xl ${resume ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      <FileText className="w-10 h-10" />
                   </div>
                   {resume && <div className="absolute -top-2 -right-2 bg-emerald-500 text-black rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>}
                </div>
                <h3 className="text-xl font-bold mb-2">{resume ? resume.name : "Select your resume"}</h3>
                <p className="text-gray-500 text-sm">Tap to browse or drag & drop (PDF, DOCX max 5MB)</p>
              </div>
            </div>
          </section>

          {/* Section 3: Social Proof */}
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">3. Achievement Gallery</h2>
                  <p className="text-sm text-gray-500">Optional artifacts from your career.</p>
                </div>
            </div>

            <div className="relative group">
              <input 
                type="file" 
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => {
                  if (e.target.files) setWorkFiles(Array.from(e.target.files));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`border-2 border-dashed rounded-[32px] p-10 text-center transition-all ${workFiles.length > 0 ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-white/20'}`}>
                <CloudUpload className="w-8 h-8 mx-auto text-gray-500 mb-4" />
                <p className="font-bold text-gray-400">Upload Project Artifacts</p>
                <p className="text-xs text-gray-600 mt-1 uppercase tracking-tighter">Images, Videos, PDFs supported</p>
                
                <AnimatePresence>
                  {workFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-wrap gap-2 justify-center relative z-30"
                    >
                      {workFiles.map((file, i) => (
                        <span key={i} className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-400">
                          {file.name}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Section 4: Experience Selection */}
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Palette className="w-5 h-5 text-gray-400" />
              Visual Foundation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEMES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-6 rounded-2xl cursor-pointer border transition-all duration-300 ${theme === t.id ? 'bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <div className={`w-full aspect-video rounded-xl bg-gradient-to-br mb-4 ${t.gradient} opacity-50`} />
                  <h4 className="font-bold mb-1">{t.title}</h4>
                  <p className="text-[10px] text-gray-500 leading-tight">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-10">
            <button 
              type="submit" 
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-bold py-6 rounded-[32px] text-xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
            >
              {isGenerating ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ANALYZING BLUEPRINT...
                </>
              ) : (
                <>
                  PUBLISH PORTFOLIO
                  <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
            <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 SECURE ENCRYPTED CHANNEL
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 AI ENGINE READY
               </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="py-20 text-center relative z-10 border-t border-white/5 max-w-4xl mx-auto">
         <p className="text-sm text-gray-600 font-medium">PromptFolio AI &bull; Transforming data into destiny.</p>
      </footer>
    </main>
  );
}
