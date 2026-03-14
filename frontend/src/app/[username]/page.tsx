import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { getPortfolio } from "@/lib/api";
import { Mail, Globe, Github, Linkedin, Briefcase, GraduationCap, Cpu, Layers, ExternalLink, FileText, Play, Image as ImageIcon } from "lucide-react";

export default async function PortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  let data;
  try {
    data = await getPortfolio(username);
  } catch (err) {
    return notFound();
  }

  if (!data) return notFound();

  // Dynamic Theme Classes
  const themes: Record<string, { bg: string, text: string, card: string, accent: string }> = {
    minimal: {
      bg: "bg-gray-50",
      text: "text-gray-900",
      card: "bg-white border border-gray-200 shadow-sm",
      accent: "text-blue-600 bg-blue-50 border-blue-200",
    },
    neon: {
      bg: "bg-[#09090b]",
      text: "text-gray-100",
      card: "bg-gray-900/80 border border-fuchsia-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(217,70,239,0.15)]",
      accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
    },
    dark: {
      bg: "bg-gray-950",
      text: "text-gray-200",
      card: "bg-gray-900 border border-gray-800",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    }
  };

  const currentTheme = themes[data.theme] || themes.minimal;

  return (
    <main className={`min-h-screen transition-colors duration-500 ${currentTheme.bg} ${currentTheme.text} font-sans`}>
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <header className="mb-20 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{data.name}</h1>
          <h2 className={`text-2xl md:text-3xl font-medium opacity-80 mb-6 ${currentTheme.text}`}>{data.title}</h2>
          <p className="text-lg opacity-70 max-w-2xl">{data.about}</p>
        </header>

        {/* Skills */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Cpu className="w-6 h-6 text-primary" />
            Technical Skills
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.skills.map((skill: string, index: number) => (
              <span key={index} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-opacity-20 ${currentTheme.accent}`}>
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-20">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            Featured Projects
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {data.projects.map((item: any, index: number) => (
              <a key={index} href={item.link} className={`block p-6 rounded-2xl transition hover:-translate-y-1 group ${currentTheme.card}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold">{item.title}</h4>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="opacity-70 text-sm leading-relaxed">{item.description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Work Files Gallery */}
        {data.workFiles.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-primary" />
              Selected Work
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.workFiles.map((file: any, i: number) => (
                <a key={i} href={file.url} target="_blank" className={`aspect-video flex items-center justify-center rounded-xl p-4 text-center hover:opacity-80 transition ${currentTheme.card}`}>
                  <div>
                    <div className="opacity-50 mb-2">
                       {file.fileType.includes('pdf') ? <FileText className="w-8 h-8 mx-auto" /> : file.fileType.includes('video') ? <Play className="w-8 h-8 mx-auto" /> : <ImageIcon className="w-8 h-8 mx-auto" />}
                    </div>
                    <span className="text-xs font-medium truncate w-full block px-2">{file.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer / Contact */}
        <footer className={`pt-10 mt-20 border-t ${data.theme === 'minimal' ? 'border-gray-200' : 'border-white/10'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-medium">Get in touch</div>
            <div className="flex gap-6 opacity-70">
              {data.contact.email && <a href={`mailto:${data.contact.email}`} className="hover:opacity-100 transition">Email</a>}
              {data.contact.linkedin && <a href={`https://${data.contact.linkedin}`} className="hover:opacity-100 transition">LinkedIn</a>}
              {data.contact.github && <a href={`https://${data.contact.github}`} className="hover:opacity-100 transition">GitHub</a>}
            </div>
          </div>
          <div className="text-center mt-12 text-sm opacity-40">
            Created with <Link href="/" className="underline hover:opacity-100">PromptFolio</Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
