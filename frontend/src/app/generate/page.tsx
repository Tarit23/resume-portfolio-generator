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
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("premium");
  const [resume, setResume] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [workFiles, setWorkFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const router = useRouter(); 

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !resume) return alert("Please fill required fields (Name, Handle, Resume)");
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("theme", theme);
      formData.append("resume", resume);
      
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }
      
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
    <main className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-amber-500/30">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-amber-900/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <header className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-[0.2em] text-amber-500 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI PORTFOLIO ARCHITECT <span className="opacity-40">v1.2.0</span>
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

        <form onSubmit={handleGenerate} className="space-y-12">
          {/* Section 1: Identity */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-14 backdrop-blur-xl">
            <div className="flex items-center gap-5 mb-12">
              <div className="w-14 h-14 rounded-[22px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">1. Personal Identity</h2>
                <p className="text-sm text-gray-500 mt-1">How you'll be represented online.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all" 
                    placeholder="e.g. Alexander Pierce"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email (Visible publicly)</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4.5 text-white placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all" 
                    placeholder="e.g. alex@example.com"
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Universal Handle</label>
                <div className="relative group flex items-center">
                  <div className="absolute left-6 text-gray-600 font-bold select-none pointer-events-none">folio.me/</div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-28 pr-6 py-4.5 text-white placeholder:text-gray-700 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all font-bold" 
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Profile Photo (Highly Recommended)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div className={`border-2 border-dashed rounded-2xl p-6 transition-all flex items-center gap-6 ${profilePhoto ? 'border-amber-500/40 bg-amber-500/5 text-amber-500' : 'border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05]'}`}>
                    <div className={`p-4 rounded-xl ${profilePhoto ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}>
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{profilePhoto ? profilePhoto.name : "Choose a professional photo"}</h4>
                      <p className="text-[10px] text-gray-500">Supports JPG, PNG (Max 2MB)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Resume */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-14 backdrop-blur-xl">
            <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-[22px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">2. The Blueprint</h2>
                  <p className="text-sm text-gray-500 mt-1">Your professional history and skills.</p>
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
              <div className={`border-2 border-dashed rounded-[32px] p-12 text-center transition-all ${resume ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05]'}`}>
                <div className="mb-6 relative inline-flex">
                   <div className={`p-6 rounded-3xl ${resume ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 text-gray-400'}`}>
                      <FileText className="w-12 h-12" />
                   </div>
                   {resume && <div className="absolute -top-2 -right-2 bg-amber-500 text-black rounded-full p-1.5 shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>}
                </div>
                <h3 className="text-xl font-black mb-2">{resume ? resume.name : "Select your Resume"}</h3>
                <p className="text-gray-500 text-sm font-medium italic opacity-60">PDF or DOCX (max 5MB)</p>
              </div>
            </div>
          </section>

          {/* Section 3: Social Proof */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-14 backdrop-blur-xl">
            <div className="flex items-center gap-5 mb-12">
                <div className="w-14 h-14 rounded-[22px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/5">
                  <CloudUpload className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">3. Work Artifacts</h2>
                  <p className="text-sm text-gray-500 mt-1">Optional images or videos from your projects.</p>
                </div>
            </div>

            <div className="relative group">
              <input 
                type="file" 
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  if (e.target.files) setWorkFiles(Array.from(e.target.files));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              <div className={`border-2 border-dashed rounded-[32px] p-10 text-center transition-all ${workFiles.length > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10 bg-white/[0.02] group-hover:bg-white/[0.05]'}`}>
                <CloudUpload className="w-10 h-10 mx-auto text-gray-600 mb-4" />
                <p className="font-bold text-gray-400">Add Project Media</p>
                <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-widest">Images, Videos supported</p>
                
                <AnimatePresence>
                  {workFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-wrap gap-2 justify-center relative z-30"
                    >
                      {workFiles.map((file, i) => (
                        <span key={i} className="text-[10px] font-black bg-white/5 border border-white/10 px-4 py-2 rounded-full text-amber-500/80">
                          {file.name}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Section 4: Theme */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 md:p-14 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-10 flex items-center gap-3">
              <Palette className="w-6 h-6 text-gray-600" />
              Visual Foundation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {THEMES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-6 rounded-[32px] cursor-pointer border transition-all duration-500 ${theme === t.id ? 'bg-amber-500/10 border-amber-500/50 shadow-2xl shadow-amber-500/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10 grayscale hover:grayscale-0'}`}
                >
                  <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br mb-6 ${t.gradient} shadow-inner shadow-black/20`} />
                  <h4 className="font-bold text-lg mb-2">{t.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-10">
            <button 
              type="submit" 
              disabled={isGenerating}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-800 text-black font-black py-7 rounded-[32px] text-2xl transition-all shadow-2xl shadow-amber-500/20 flex items-center justify-center gap-4 group active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <div className="w-7 h-7 border-[4px] border-black border-t-transparent rounded-full animate-spin" />
                  ARCHITECTING...
                </>
              ) : (
                <>
                  GENERATE PORTFOLIO
                  <Rocket className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
            <div className="mt-8 flex items-center justify-center gap-10 text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                 SERVER ONLINE
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40" />
                 AI ENGINE READY
               </div>
            </div>
          </div>
        </form>
      </div>

      <footer className="py-20 text-center relative z-10 border-t border-white/5 max-w-4xl mx-auto">
         <p className="text-xs text-gray-600 font-bold tracking-[0.1em] uppercase">PromptFolio &bull; The Architecture of Digital Identity</p>
      </footer>
    </main>
  );
}
