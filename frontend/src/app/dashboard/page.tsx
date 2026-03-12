import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { getPortfolio } from "@/lib/api";
import { Layout, Eye, Edit3, BarChart3, Rocket, Plus } from "lucide-react";

export default async function Dashboard() {
  // In a real app we fetch user session. Here we assume 'johndoe' exists if they just generated.
  const username = "johndoe"; 
  
  let portfolioData = null;
  try {
    portfolioData = await getPortfolio(username);
  } catch (err) {
    console.error("No portfolio found yet.");
  }

  const hasPortfolio = !!portfolioData;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <nav className="max-w-5xl mx-auto flex justify-between items-center py-6 border-b border-white/5 mb-12">
        <Link href="/" className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          PromptFolio
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="opacity-70">Welcome back, {username}</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>

        {hasPortfolio ? (
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold mb-4 uppercase tracking-wider">
                  Live
                </div>
                <h2 className="text-2xl font-bold mb-2">My Professional Portfolio</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={`/${username}`} target="_blank" className="hover:text-blue-400 hover:underline transition">
                    promptfolio.site/{username}
                  </a>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href={`/${username}`}>
                  <AnimatedButton variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live
                  </AnimatedButton>
                </Link>
                <Link href="/generate">
                  <AnimatedButton variant="secondary">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Details
                  </AnimatedButton>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5">
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Total Views</h4>
                <p className="text-3xl font-bold text-white">1,248</p>
                <span className="text-xs text-green-400 mt-2 block">+12% this week</span>
              </div>
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Clicks on Resume</h4>
                <p className="text-3xl font-bold text-white">84</p>
                <span className="text-xs text-green-400 mt-2 block">+5% this week</span>
              </div>
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Current Theme</h4>
                <div className="flex items-center gap-3 mt-1 text-xl font-bold">
                  <span className="w-4 h-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-300"></span>
                  Minimal
                </div>
                <Link href="/generate" className="text-xs text-blue-400 mt-2 block hover:underline">Change Theme →</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-white/10">
            <h2 className="text-2xl font-bold mb-4">No Portfolio Yet!</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Upload your resume and let AI generate a stunning portfolio for you in seconds.
            </p>
            <Link href="/generate">
              <AnimatedButton variant="primary">Create New Portfolio</AnimatedButton>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
