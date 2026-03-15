"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { useRouter } from "next/navigation";
import { generatePortfolio } from "@/lib/api";
import { User, Palette, CloudUpload, FileText, Sparkles, Zap, Globe, Rocket } from "lucide-react";

const THEMES = [
  { id: "minimal", title: "Zen Minimal", desc: "Pure, elegant, and focused on content.", gradient: "from-white/10 to-white/5" },
  { id: "neon", title: "Cyber Neon", desc: "High-energy futuristic cyberpunk vibe.", gradient: "from-fuchsia-500/20 to-purple-500/20" },
  { id: "dark", title: "Deep Space", desc: "Sophisticated dark mode for developers.", gradient: "from-emerald-500/10 to-teal-500/10" },
];

export default function GeneratePortfolio() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("minimal");
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
    <main className="min-h-screen bg-[#030014] text-white relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-[1400px] mx-auto px-6 py-16 relative z-10">
        <header className="flex flex-col items-start mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider text-blue-400 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED PORTFOLIO BUILDER
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-[0.9]"
          >
            CRAFT YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 px-1 font-black">LEGACY.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-xl"
          >
            The world's first AI architect that transforms your resume into a stunning, high-performance digital portfolio in seconds.
          </motion.p>
        </header>

        <form onSubmit={handleGenerate} className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          <div className="space-y-12">
            {/* Step 1: Identity */}
            <section className="glass rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <User className="w-32 h-32" />
              </div>
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><User className="w-5 h-5" /></span>
                1. Your Identity
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600" 
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-400 ml-1 uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500">folio.me/</span>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-[90px] pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600" 
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: The Core */}
            <section className="glass rounded-[40px] p-10">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20"><FileText className="w-5 h-5" /></span>
                2. The Blueprint
              </h2>
              <div className="border-2 border-dashed border-white/10 rounded-[30px] p-12 text-center hover:bg-white/5 transition-all cursor-pointer relative group">
                <input 
                  type="file" 
                  required
                  accept=".pdf,.docx"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-50 group-hover:scale-100 transition-transform" />
                  <FileText className="w-16 h-16 mx-auto text-blue-400 relative z-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{resume ? resume.name : "Drop your resume here"}</h3>
                <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">PDF or DOCX • Max 5MB</p>
              </div>
            </section>

            {/* Step 3: Social Proof */}
            <section className="glass rounded-[40px] p-10">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><CloudUpload className="w-5 h-5" /></span>
                3. Social Proof
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="border-2 border-dashed border-white/10 rounded-[30px] p-10 text-center hover:bg-white/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    multiple
                    accept="image/*,video/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files) setWorkFiles(Array.from(e.target.files));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className="flex flex-col items-center">
                    <CloudUpload className="w-10 h-10 text-emerald-400 mb-4" />
                    <p className="font-bold text-lg mb-1">Add Case Studies & Projects</p>
                    <p className="text-sm text-gray-500">Upload images, videos, or PDF walkthroughs</p>
                  </div>
                  <AnimatePresence>
                    {workFiles.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 flex flex-wrap gap-2 justify-center relative z-30"
                      >
                        {workFiles.map((file: File, i: number) => (
                          <span key={i} className="text-[10px] uppercase font-bold tracking-tighter bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            {file.name}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-8 space-y-8">
            <div className="glass rounded-[40px] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Palette className="w-5 h-5 text-pink-400" />
                Vibe Check
              </h3>
              <div className="space-y-4">
                {THEMES.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-5 rounded-3xl cursor-pointer border transition-all ${theme === t.id ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5 opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.gradient}`} />
                      <div>
                        <h4 className="font-bold">{t.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-1 rounded-[40px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/20">
              <button 
                type="submit" 
                disabled={isGenerating}
                className="w-full bg-black/95 hover:bg-black/90 text-white rounded-[38px] p-8 font-black text-2xl tracking-tighter transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    NEURAL PROCESSING...
                  </>
                ) : (
                  <>
                    LAUNCH FOLIO
                    <Rocket className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
              Secure Cloud Processing Engaged
            </p>
          </aside>
        </form>
      </div>
      
      {/* Decorative Blob */}
      <div className="fixed -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
    </main>
  );
}
