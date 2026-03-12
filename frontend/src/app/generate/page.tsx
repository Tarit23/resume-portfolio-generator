"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { useRouter } from "next/navigation";
import { generatePortfolio } from "@/lib/api";
import { User, Shield, Palette, CloudUpload, Sparkles, FileText } from "lucide-react";

const THEMES = [
  { id: "minimal", title: "Minimal Professional", desc: "Clean, whitespace-heavy design", gradient: "from-gray-100 to-gray-300" },
  { id: "neon", title: "Futuristic Neon", desc: "Dark mode with bright neon accents", gradient: "from-purple-500 to-pink-500" },
  { id: "dark", title: "Dark Developer", desc: "Code-focused dark interface", gradient: "from-gray-800 to-black" },
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
      alert(error.response?.data?.error || "Failed to generate portfolio. Make sure the backend is running.");
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto pt-20 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Generate Your Portfolio
          </h1>
          <p className="text-gray-400">Fill in the details below and let AI do the magic.</p>
        </motion.div>

        <form onSubmit={handleGenerate} className="space-y-12">
          {/* Basic Info */}
          <section className="bg-gray-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm"><User className="w-4 h-4" /></span>
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username (For your URL)</label>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="johndoe"
                />
              </div>
            </div>
          </section>

          {/* Resume Upload */}
          <section className="bg-gray-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm"><FileText className="w-4 h-4" /></span>
              Upload Resume (PDF/DOCX)
            </h2>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                required
                accept=".pdf,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="text-blue-400 mb-2">
                <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="font-medium">{resume ? resume.name : "Click to upload or drag and drop"}</p>
              <p className="text-sm text-gray-500 mt-1">PDF or DOCX up to 5MB</p>
            </div>
          </section>

          {/* Theme Selection */}
          <section className="bg-gray-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm"><Palette className="w-4 h-4" /></span>
              Select Theme
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {THEMES.map((t) => (
                <ThemeCard 
                  key={t.id}
                  title={t.title}
                  description={t.desc}
                  gradient={t.gradient}
                  selected={theme === t.id}
                  onClick={() => setTheme(t.id)}
                />
              ))}
            </div>
          </section>

          {/* Extra Work Upload */}
          <section className="bg-gray-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm"><CloudUpload className="w-4 h-4" /></span>
              Upload Your Work (Optional)
            </h2>
            <p className="text-gray-400 mb-6 ml-10">Add images, videos, or PDFs of your past projects to showcase on your portfolio.</p>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple
                accept="image/*,video/*,.pdf"
                onChange={(e) => {
                  if (e.target.files) setWorkFiles(Array.from(e.target.files));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="font-medium text-blue-400">Click to upload multiple files</p>
              <p className="text-sm text-gray-500 mt-1">Images, Videos, PDFs supported</p>
              {workFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {workFiles.map((file: File, i: number) => (
                    <span key={i} className="text-xs bg-white/10 px-3 py-1 rounded-full">{file.name}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="text-center pt-8 border-t border-white/10">
            <AnimatedButton 
              type="submit" 
              disabled={isGenerating}
              className={`w-full md:w-auto px-12 py-5 text-xl ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing AI...
                </span>
              ) : 'Generate Portfolio'}
            </AnimatedButton>
          </div>
        </form>
      </div>
    </main>
  );
}
