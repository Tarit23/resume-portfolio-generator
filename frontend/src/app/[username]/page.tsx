import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/lib/api";
import { Mail, Github, Linkedin, Cpu, Layers, ExternalLink, FileText, Play, Image as ImageIcon, Sparkles, Rocket, Zap } from "lucide-react";
import PortfolioGallery from "@/components/PortfolioGallery";

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  let data;
  try {
    data = await getPortfolio(username);
  } catch (err) {
    return notFound();
  }

  if (!data) return notFound();

  // Futuristic Theme Definitions
  const themes: Record<string, { bg: string, text: string, card: string, accent: string, overlay: string, btn: string, glow: string }> = {
    premium: {
      bg: "bg-[#050505]",
      text: "text-white",
      card: "bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-white/20",
      accent: "text-[#F59E0B]",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      overlay: "bg-gradient-to-b from-[#F59E0B]/5 to-transparent",
      btn: "bg-[#F59E0B] text-black hover:bg-[#D97706] font-black",
    },
    minimal: {
      bg: "bg-[#050505]",
      text: "text-white",
      card: "bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-white/20",
      accent: "text-blue-400",
      glow: "",
      overlay: "bg-gradient-to-b from-blue-500/5 to-transparent",
      btn: "bg-white text-black hover:bg-gray-200",
    },
    neon: {
      bg: "bg-[#030014]",
      text: "text-gray-100",
      card: "bg-purple-900/10 border border-fuchsia-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:border-fuchsia-500/40",
      accent: "text-fuchsia-400",
      glow: "shadow-[0_0_20px_rgba(217,70,239,0.3)]",
      overlay: "bg-gradient-to-br from-fuchsia-600/10 via-transparent to-blue-600/10",
      btn: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30",
    },
    dark: {
      bg: "bg-[#020617]",
      text: "text-gray-200",
      card: "bg-slate-900/40 border border-emerald-500/10 hover:border-emerald-500/30",
      accent: "text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      overlay: "mesh-gradient opacity-40",
      btn: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold",
    }
  };

  const currentTheme = themes[data.theme] || themes.premium;

  return (
    <main className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-700 ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Dynamic Background Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${currentTheme.overlay}`} />
      
      {/* Centered Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12">
        
        {/* Navigation / Minimal Header */}
        <nav className="py-12 flex justify-center items-center">
            <Link href="/" className="text-sm font-black tracking-[0.3em] flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <Zap className={`w-4 h-4 ${data.theme === 'premium' || !data.theme ? 'text-[#F59E0B]' : 'text-blue-500'}`} />
              PROMPTFOLIO
            </Link>
        </nav>

        <article className="pt-12 pb-32">
          
          {/* Centered Hero Section */}
          <header className="mb-32 text-center">
            {/* Profile Image (Simulated if available, else initials/icon) */}
            <div className={`w-32 h-32 mx-auto mb-10 rounded-full border-2 border-white/10 p-1 ${currentTheme.glow}`}>
               <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                  {data.contact?.github ? (
                    <img src={`https://github.com/${data.contact.github}.png`} alt={data.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black opacity-20">{data.name?.charAt(0)}</span>
                  )}
               </div>
            </div>

            <div className={`inline-block mb-4 text-sm font-black tracking-[0.2em] uppercase ${currentTheme.accent}`}>
               {data.title}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
              {data.name}
            </h1>
            
            <p className="text-xl md:text-2xl opacity-50 max-w-2xl mx-auto leading-relaxed mb-12">
              {data.about}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
               {data.contact.email && (
                 <a href={`mailto:${data.contact.email}`} className={`px-8 py-4 rounded-full transition-all flex items-center gap-2 ${currentTheme.btn}`}>
                    <Mail className="w-4 h-4" /> Hire Me
                 </a>
               )}
               <a 
                href="#work"
                className="px-8 py-4 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-bold flex items-center gap-2"
               >
                  View My Work
               </a>
            </div>
          </header>

          {/* Tools & Expertise */}
          <section className="mb-32 text-center">
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30 mb-10">
              Tools & Expertise
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {data.skills.map((skill: string, index: number) => (
                <span key={index} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold hover:border-white/20 transition-all">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Selected Work (Focus on content) */}
          <div id="work" className="mb-32">
             <div className="text-center mb-16">
                <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30 mb-4">Selected Work</h3>
                <h2 className="text-3xl font-bold tracking-tight">Case Studies & Projects</h2>
             </div>
             <PortfolioGallery files={data.workFiles || []} theme={currentTheme} />
          </div>

          {/* Experience Roadmap (Simplified) */}
          <section className="mb-32 max-w-2xl mx-auto">
              <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30 mb-12 text-center">
                Professional Journey
              </h3>
              <div className="space-y-12">
                {data.experience.map((item: any, index: number) => (
                  <div key={index} className="flex gap-8 group">
                    <div className="text-sm font-bold opacity-30 w-32 pt-1">{item.duration}</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-1 group-hover:text-[#F59E0B] transition-colors">{item.role}</h4>
                      <div className="text-sm font-bold opacity-50 mb-3">{item.company}</div>
                      <p className="text-base opacity-40 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
          </section>

          {/* Footer Contact */}
          <footer className="pt-32 pb-16 text-center border-t border-white/5">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 italic">
              Let's <span className={currentTheme.accent}>Work Together</span>
            </h2>
            <p className="opacity-40 text-lg mb-12 max-w-md mx-auto">
              Got a project in mind? I'm always open to new creative collaborations.
            </p>
            
            <div className="flex justify-center gap-6 mb-16">
               {data.contact.email && (
                 <a href={`mailto:${data.contact.email}`} className={`p-4 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all ${currentTheme.accent}`}>
                    <Mail className="w-6 h-6" />
                 </a>
               )}
               {data.contact.github && (
                 <a href={`https://github.com/${data.contact.github}`} target="_blank" className="p-4 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                    <Github className="w-6 h-6" />
                 </a>
               )}
               {data.contact.linkedin && (
                 <a href={`https://linkedin.com/in/${data.contact.linkedin}`} target="_blank" className="p-4 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                    <Linkedin className="w-6 h-6" />
                 </a>
               )}
            </div>

            <div className="text-[10px] font-black tracking-[0.5em] opacity-20 uppercase">
               © 2026 {data.name}. All rights reserved.
            </div>
          </footer>

        </article>
      </div>
    </main>
  );
}
