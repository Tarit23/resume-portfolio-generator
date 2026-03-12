import { AnimatedButton } from "@/components/ui/AnimatedButton";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/50 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PromptFolio
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center relative z-10 min-h-[80vh]">
        <div className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8">
          AI-Powered Portfolio Generator
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Turn Your Resume Into a <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Stunning Portfolio</span> Website
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl">
          Upload your resume and get a professional, beautifully designed portfolio instantly. Stand out in the competitive job market without writing a single line of code.
        </p>
        <div className="flex gap-4 items-center">
          <Link href="/generate">
            <AnimatedButton variant="primary" className="text-lg px-8 py-4">
              Generate My Portfolio
            </AnimatedButton>
          </Link>
          <Link href="#how-it-works">
            <AnimatedButton variant="secondary" className="text-lg px-8 py-4">
              See How It Works
            </AnimatedButton>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative z-10 bg-gray-900/50 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to your new professional identity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Resume", desc: "Share your PDF or DOCX resume with our system." },
              { step: "02", title: "AI Extraction", desc: "Our advanced AI extracts and structures your experience." },
              { step: "03", title: "Instant Portfolio", desc: "Choose a theme and get your shareable link immediately." }
            ].map((s, i) => (
              <div key={i} className="bg-gray-950 p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 group-hover:bg-blue-500/10 transition-colors" />
                <div className="text-5xl font-black text-white/5 mb-6">{s.step}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
