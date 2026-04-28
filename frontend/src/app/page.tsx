import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Target, MousePointer2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8f3] text-[#201b11] overflow-hidden relative font-outfit">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full bg-[#eeae01]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#fff8f3]/80 backdrop-blur-xl border-b border-[#907339]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Zap className="w-5 h-5 text-[#eeae01] fill-[#eeae01]/20 group-hover:scale-110 transition-transform" />
            <span className="font-black text-xl tracking-[0.2em] uppercase text-[#907339]">PromptFolio</span>
          </div>
          <div className="flex gap-8">
            <Link href="/dashboard" className="text-[10px] font-black tracking-widest text-[#7f7669] hover:text-[#eeae01] transition-colors uppercase">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 flex flex-col items-center justify-center text-center relative z-10 min-h-screen">
        <div className="inline-flex items-center gap-3 py-2 px-5 rounded-full bg-white border border-[#907339]/20 text-[#eeae01] text-[10px] font-black tracking-[0.3em] uppercase mb-12 shadow-xl shadow-[#eeae01]/5">
          <Sparkles className="w-3.5 h-3.5" />
          The Future of Digital Identity
        </div>
        
        <h1 className="text-6xl md:text-[6.5rem] font-black tracking-tighter mb-10 max-w-5xl leading-[0.9] text-[#201b11]">
          Turn Data Into <span className="text-[#eeae01] italic underline decoration-[#eeae01]/30 underline-offset-[12px]">Impact</span>.
        </h1>
        
        <p className="text-xl md:text-2xl text-[#504533] mb-16 max-w-2xl font-medium leading-relaxed">
          Simply upload your PDF resume, choose a theme, and let our AI engine orchestrate a world-class digital presence for you in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Link href="/generate">
            <button className="px-10 py-6 bg-[#eeae01] hover:bg-[#d99f01] text-white font-black rounded-[32px] text-lg transition-all shadow-2xl shadow-[#eeae01]/30 flex items-center gap-3 group active:scale-[0.98]">
              Generate My Portfolio
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="#how-it-works" className="px-10 py-6 border border-[#907339]/20 bg-white/50 hover:bg-white backdrop-blur-3xl rounded-[32px] text-lg font-black transition-all text-[#907339]">
            See How It Works
          </Link>
        </div>

        {/* Floating Mouse Cursor indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40 text-[#eeae01]">
          <MousePointer2 className="w-6 h-6" />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-40 px-6 relative z-10 border-t border-[#907339]/10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h3 className="text-[10px] font-black tracking-[0.5em] text-[#eeae01] uppercase mb-6">WORKFLOW PARADIGM</h3>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#201b11]">Architecture of Creation</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: <Target className="w-6 h-6" />, title: "Data Ingestion", desc: "Upload your professional blueprint in PDF format for deep analysis." },
              { icon: <Zap className="w-6 h-6" />, title: "AI Orchestration", desc: "Our engine parses your resume and structures it into a premium narrative." },
              { icon: <Sparkles className="w-6 h-6" />, title: "Instant Deployment", desc: "Receive a pixel-perfect, shareable portfolio link optimized for every device." }
            ].map((s, i) => (
              <div key={i} className="bg-white p-12 rounded-[40px] border border-[#907339]/10 relative overflow-hidden group hover:border-[#eeae01]/50 hover:shadow-xl hover:shadow-[#eeae01]/5 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-[#eeae01]/10 border border-[#eeae01]/20 flex items-center justify-center text-[#eeae01] mb-10 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-[#201b11]">{s.title}</h3>
                <p className="text-[#504533] leading-relaxed font-medium">{s.desc}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eeae01]/5 rounded-bl-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="py-20 text-center border-t border-[#907339]/10 opacity-60">
        <p className="text-xs font-black tracking-[0.5em] uppercase text-[#7f7669]">PROMPTFOLIO &bull; LIMITLESS POTENTIAL</p>
      </footer>
    </main>
  );
}
