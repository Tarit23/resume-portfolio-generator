import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/lib/api";
import { Mail, Github, Linkedin, Cpu, Layers, ExternalLink, FileText, Play, Image as ImageIcon, Sparkles, Rocket, Zap, Eye } from "lucide-react";
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
    <main className={`min-h-screen relative overflow-hidden transition-colors duration-700 font-outfit ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Dynamic Background Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${currentTheme.overlay}`} />
      
      {/* Centered Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Navigation / Minimal Header */}
        <nav className="py-12 flex justify-center items-center">
            <Link href="/" className="text-[10px] font-black tracking-[0.6em] flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity uppercase">
              <Zap className={`w-3.5 h-3.5 ${data.theme === 'premium' || !data.theme ? 'text-[#F59E0B]' : 'text-blue-500'}`} />
              PROMPTFOLIO
            </Link>
        </nav>

        <article className="pt-20 pb-40">
          
          {/* Centered Hero Section (Premium Lovable Style) */}
          <header className="mb-40 text-center">
            {/* Profile Image with Neon Glow */}
            <div className="relative inline-block mb-12">
               <div className={`w-32 h-32 rounded-full border border-white/10 p-1 relative z-10 overflow-hidden ${currentTheme.glow}`}>
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                     {data.profileImageUrl ? (
                       <img 
                        src={data.profileImageUrl} 
                        alt={data.name} 
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                       />
                     ) : data.contact?.github ? (
                       <img 
                        src={`https://github.com/${data.contact.github}.png`} 
                        alt={data.name} 
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                       />
                     ) : (
                       <span className="text-4xl font-black opacity-20">{data.name?.charAt(0)}</span>
                     )}
                  </div>
               </div>
               {/* Accent decoration */}
               <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-[#F59E0B] opacity-20 blur-2xl animate-pulse" />
            </div>

            <div className={`block mb-6 text-xs font-black tracking-[0.5em] uppercase px-4 ${currentTheme.accent}`}>
               {data.title}
            </div>
            
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter mb-10 leading-[1] text-gradient">
              {data.name}
            </h1>
            
            <p className="text-xl md:text-2xl opacity-40 max-w-2xl mx-auto leading-relaxed mb-14 font-medium italic">
              — {data.about}
            </p>

            <div className="flex flex-wrap justify-center gap-5">
               {data.contact.email && (
                 <a 
                  href={`mailto:${data.contact.email}`} 
                  className={`px-10 py-5 rounded-full transition-all flex items-center gap-2 text-sm font-black shadow-2xl ${currentTheme.btn}`}
                 >
                    <Mail className="w-4 h-4" /> Reach Out
                 </a>
               )}
               <a 
                href="#work"
                className="px-10 py-5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-3xl transition-all text-sm font-black flex items-center gap-2"
               >
                  <Eye className="w-4 h-4" /> Explore Work
               </a>
            </div>
          </header>

          {/* Tools & Expertise (Streamlined Pill Style) */}
          <section className="mb-40 text-center">
            <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20 mb-12">
              Expertise & Specialized Tools
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {data.skills.map((skill: string, index: number) => (
                <span key={index} className="px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 text-[13px] font-bold hover:border-white/20 transition-all hover:bg-white/[0.05] cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Selected Work (The Gallery) */}
          <div id="work" className="mb-40">
             <div className="text-center mb-20">
                <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20 mb-6">CURATED PROJECTS</h3>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Case Studies</h2>
             </div>
             <PortfolioGallery files={data.workFiles || []} theme={currentTheme} />
          </div>

          {/* Experience Roadmap (Centered Minimalist) */}
          <section className="mb-40 max-w-3xl mx-auto">
              <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-20 mb-16 text-center">
                PROFESSIONAL ARCHITECTURE
              </h3>
              <div className="space-y-16">
                {data.experience.map((item: any, index: number) => (
                  <div key={index} className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-12 group">
                    <div className="text-xs font-black tracking-widest opacity-20 pt-2 uppercase">{item.duration}</div>
                    <div>
                      <h4 className="text-2xl font-black mb-2 group-hover:text-[#F59E0B] transition-colors">{item.role}</h4>
                      <div className="text-sm font-bold opacity-60 mb-5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] opacity-40" />
                        {item.company}
                      </div>
                      <p className="text-lg opacity-40 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
          </section>

          {/* Contact (High Impact Lovable Style) */}
          <footer className="pt-40 pb-20 text-center border-t border-white/5">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 leading-none">
              Let's <span className={`italic underline decoration-amber-500/20 underline-offset-8 ${currentTheme.accent}`}>Create</span> Together
            </h2>
            <p className="opacity-40 text-xl mb-14 max-w-lg mx-auto font-medium">
              Ready to bring your next visionary idea to life? Let's connect and build something extraordinary.
            </p>
            
            <div className="flex justify-center gap-8 mb-20">
               {data.contact.email && (
                 <a href={`mailto:${data.contact.email}`} className="group relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-5 rounded-full bg-white/5 border border-white/10 hover:border-[#F59E0B]/50 transition-all text-[#F59E0B]">
                       <Mail className="w-7 h-7" />
                    </div>
                 </a>
               )}
               {data.contact.github && (
                 <a href={`https://github.com/${data.contact.github}`} target="_blank" className="p-5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                    <Github className="w-7 h-7" />
                 </a>
               )}
               {data.contact.linkedin && (
                 <a href={`https://linkedin.com/in/${data.contact.linkedin}`} target="_blank" className="p-5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 transition-all">
                    <Linkedin className="w-7 h-7" />
                 </a>
               )}
            </div>

            <div className="text-[10px] font-black tracking-[0.8em] opacity-10 uppercase">
               CODE BY PROMPTFOLIO • 2026
            </div>
          </footer>

        </article>
      </div>
    </main>
  );
}
