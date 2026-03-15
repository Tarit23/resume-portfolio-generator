import { notFound } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/lib/api";
import { Mail, Github, Linkedin, Cpu, Layers, ExternalLink, FileText, Play, Image as ImageIcon, Sparkles, Rocket, Zap } from "lucide-react";

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
  const themes: Record<string, { bg: string, text: string, card: string, accent: string, overlay: string, btn: string }> = {
    minimal: {
      bg: "bg-[#050505]",
      text: "text-white",
      card: "bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-white/20",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      overlay: "bg-gradient-to-b from-blue-500/5 to-transparent",
      btn: "bg-white text-black hover:bg-gray-200",
    },
    neon: {
      bg: "bg-[#030014]",
      text: "text-gray-100",
      card: "bg-purple-900/10 border border-fuchsia-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(217,70,239,0.1)] hover:border-fuchsia-500/40",
      accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
      overlay: "bg-gradient-to-br from-fuchsia-600/10 via-transparent to-blue-600/10",
      btn: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/30",
    },
    dark: {
      bg: "bg-[#020617]",
      text: "text-gray-200",
      card: "bg-slate-900/40 border border-emerald-500/10 hover:border-emerald-500/30",
      accent: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20",
      overlay: "mesh-gradient opacity-40",
      btn: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold",
    }
  };

  const currentTheme = themes[data.theme] || themes.minimal;

  return (
    <main className={`min-h-screen relative overflow-hidden font-sans transition-colors duration-700 ${currentTheme.bg} ${currentTheme.text}`}>
      {/* Dynamic Background Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${currentTheme.overlay}`} />
      <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none z-0" />

      <div className="relative z-10">
        {/* Navigation / Header */}
        <nav className="full-screen-container py-8 flex justify-between items-center border-b border-white/5 mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              PROMPTFOLIO
            </Link>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest border border-white/5 px-2 py-1 rounded">v1.0.2</span>
          </div>
          <div className="flex gap-4">
             {data.contact.email && <a href={`mailto:${data.contact.email}`} className="p-2 rounded-full hover:bg-white/5 transition-colors"><Mail className="w-5 h-5" /></a>}
             {data.contact.github && <a href={`https://github.com/${data.contact.github}`} target="_blank" className="p-2 rounded-full hover:bg-white/5 transition-colors"><Github className="w-5 h-5" /></a>}
          </div>
        </nav>

        <article className="full-screen-container pt-24 pb-32 mx-auto">
          
          {/* Hero Section */}
          <header className="mb-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold tracking-widest text-blue-400 mb-8 uppercase">
               <Sparkles className="w-3 h-3" />
               Generated Portfolio
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] text-gradient">
              {data.name}
            </h1>
            <div className="grid md:grid-cols-[2fr_1fr] gap-12 items-end">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold opacity-90 mb-8 tracking-tight">{data.title}</h2>
                <p className="text-xl md:text-2xl opacity-60 max-w-2xl leading-relaxed">
                  {data.about}
                </p>
              </div>
              <div className="hidden md:block">
                 <div className="p-8 rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-3xl">
                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-40 mb-4">Current Status</div>
                    <div className="flex items-center gap-3">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="font-bold tracking-tight">Available for new opportunities</span>
                    </div>
                 </div>
              </div>
            </div>
          </header>

          {/* Technical Arsenal */}
          <section className="mb-40">
            <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-12 flex items-center gap-4">
              <span className="h-[1px] w-12 bg-white/20" />
              Technical Arsenal
            </h3>
            <div className="flex flex-wrap gap-4">
              {data.skills.map((skill: string, index: number) => (
                <span key={index} className={`px-8 py-4 rounded-2xl text-lg font-bold border transition-all hover:scale-105 ${currentTheme.accent}`}>
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Selected Work (Immersive Gallery) */}
          {data.workFiles.length > 0 && (
            <section className="mb-40">
              <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-12 flex items-center gap-4">
                <span className="h-[1px] w-12 bg-white/20" />
                Selected Case Studies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.workFiles.map((file: any, i: number) => (
                  <div key={i} className={`group relative rounded-[40px] overflow-hidden ${currentTheme.card} transition-all duration-500`}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {file.fileType.includes('image') ? (
                        <img 
                          src={file.url} 
                          alt={file.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : file.fileType.includes('video') ? (
                        <video 
                          src={file.url} 
                          className="w-full h-full object-cover" 
                          autoPlay muted loop 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <FileText className="w-16 h-16 opacity-20" />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-8 text-center backdrop-blur-sm">
                        <p className="font-bold text-lg">{file.name}</p>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`px-6 py-2 rounded-full font-bold text-sm transition-transform hover:scale-110 flex items-center gap-2 ${currentTheme.btn}`}
                        >
                          View Full <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experience Roadmap */}
          <section className="grid lg:grid-cols-2 gap-24 mb-40">
            <div>
              <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-12 flex items-center gap-4">
                <span className="h-[1px] w-12 bg-white/20" />
                The Journey
              </h3>
              <div className="space-y-12">
                {data.experience.map((item: any, index: number) => (
                  <div key={index} className="relative pl-8 border-l border-white/10 group">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-150 transition-transform" />
                    <div className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest">{item.duration}</div>
                    <h4 className="text-2xl font-bold mb-1">{item.role}</h4>
                    <div className="text-lg opacity-60 mb-4">{item.company}</div>
                    <p className="opacity-40 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-12 flex items-center gap-4">
                <span className="h-[1px] w-12 bg-white/20" />
                Featured Initiatives
              </h3>
              <div className="grid gap-6">
                {data.projects.map((item: any, index: number) => (
                  <a key={index} href={item.link} className={`p-8 rounded-[32px] transition-all hover:translate-x-4 ${currentTheme.card}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-bold">{item.title}</h4>
                      <Rocket className="w-5 h-5 opacity-40 group-hover:opacity-100 transition" />
                    </div>
                    <p className="opacity-60 leading-relaxed mb-6">{item.description}</p>
                    <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-widest">
                       Deep Dive <Zap className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Footer Footer */}
          <footer className="pt-24 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div>
              <div className="text-4xl font-black tracking-tighter mb-4 text-gradient">Let's build the future together.</div>
              <p className="opacity-40 text-lg">Always open for collaborations and revolutionary ideas.</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-6">
               <div className="flex gap-8 text-xl font-bold uppercase tracking-widest">
                  {data.contact.linkedin && <a href={`https://linkedin.com/in/${data.contact.linkedin}`} className="hover:text-blue-400 transition-colors">LinkedIn</a>}
                  {data.contact.github && <a href={`https://github.com/${data.contact.github}`} className="hover:text-purple-400 transition-colors">GitHub</a>}
               </div>
               <div className="text-[10px] font-black tracking-[0.5em] opacity-20 uppercase">
                  Powered by <Link href="/" className="hover:opacity-100 transition-opacity">PROMPTFOLIO AI</Link> • 2026
               </div>
            </div>
          </footer>

        </article>
      </div>
    </main>
  );
}
