"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Play, X, ExternalLink, Maximize2, Zap, ZoomIn } from "lucide-react";

interface WorkFile {
  url: string;
  fileType: string;
  name: string;
}

interface PortfolioGalleryProps {
  files: WorkFile[];
  theme: any;
}

export default function PortfolioGallery({ files, theme }: PortfolioGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<WorkFile | null>(null);
  const [loadedMedia, setLoadedMedia] = useState<Record<string, boolean>>({});
  const [mediaErrors, setMediaErrors] = useState<Record<string, boolean>>({});

  const handleMediaLoad = (url: string) => {
    setLoadedMedia(prev => ({ ...prev, [url]: true }));
  };

  const handleMediaError = (url: string) => {
    console.error(`Failed to load media: ${url}`);
    setMediaErrors(prev => ({ ...prev, [url]: true }));
  };

  // Helper to ensure URLs are properly handled
  const safeUrl = (url: string) => {
    if (!url) return "";
    // Handle special characters in Cloudinary URLs
    try {
       // Cloudinary URLs usually come encoded, but we ensure they are safe for standard <img> tags
       // Sometimes double encoding is an issue, so we do a simple check
       if (url.includes('%')) return url;
       return encodeURI(url);
    } catch (e) {
       return url;
    }
  };

  if (!files || files.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {files.map((file, i) => {
          const isVideo = file.fileType.includes("video");
          const isImage = file.fileType.includes("image");
          const url = safeUrl(file.url);
          const isLoaded = loadedMedia[file.url];
          const hasError = mediaErrors[file.url];

          // Make the first video a "Large Feature" or "Demo Reel" style if it's the first item
          const isFeature = i === 0 && (isVideo || files.length === 1);

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`group relative rounded-[32px] overflow-hidden ${theme.card} border-white/5 transition-all duration-700 cursor-pointer ${isFeature ? 'md:col-span-2 aspect-video' : 'aspect-[16/10]'}`}
              onClick={() => setSelectedFile(file)}
            >
              {isFeature && isVideo && (
                <div className="absolute top-8 left-8 z-20 px-4 py-1.5 bg-[#F59E0B] text-[black] text-[10px] font-black tracking-[0.3em] uppercase rounded-full shadow-2xl">
                  DEMO REEL
                </div>
              )}

              {/* Enhanced Loader */}
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02] backdrop-blur-sm z-30">
                   <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/[0.03] gap-4 p-8 text-center z-30">
                   <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                     <X className="w-6 h-6 text-red-500/50" />
                   </div>
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2 text-red-400">MEDIA LOAD FAILED</div>
                     <p className="text-[10px] opacity-20 font-mono mb-4">{file.name}</p>
                   </div>
                   <a 
                    href={file.url} 
                    target="_blank" 
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                   >
                     Direct Link ↗
                   </a>
                </div>
              )}

              <div className="w-full h-full relative overflow-hidden bg-black/40">
                {isImage ? (
                  <img 
                    src={url} 
                    alt={file.name} 
                    onLoad={() => handleMediaLoad(file.url)}
                    onError={() => handleMediaError(file.url)}
                    crossOrigin="anonymous"
                    className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
                  />
                ) : isVideo ? (
                  <div className="relative w-full h-full">
                    <video 
                      className={`w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                      muted 
                      loop 
                      playsInline
                      autoPlay
                      preload="auto"
                      onCanPlay={() => handleMediaLoad(file.url)}
                      onError={() => handleMediaError(file.url)}
                      crossOrigin="anonymous"
                    >
                      <source src={url} type={file.fileType} />
                    </video>
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl">
                        <Play className="w-8 h-8 fill-white text-white ml-1.5" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] gap-6">
                    <div className="w-20 h-20 rounded-[32px] bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <FileText className="w-10 h-10 opacity-20" />
                    </div>
                    <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em] truncate max-w-[80%] px-4">{file.name}</span>
                  </div>
                )}
                
                {/* Content Overlay (Premium Slide-Up) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 transform translate-y-4 group-hover:translate-y-0">
                   <div className="text-[10px] font-black tracking-[0.3em] text-[#F59E0B] mb-3 uppercase">SELECTED CASE STUDY</div>
                   <h4 className="font-black text-2xl tracking-tight leading-none mb-4">{file.name}</h4>
                   <div className="flex items-center gap-2 text-[10px] font-black tracking-widest opacity-60 uppercase">
                      VIEW FULL CASE <ExternalLink className="w-3 h-3" />
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedFile(null)}
                className="absolute top-0 right-0 p-4 text-white/60 hover:text-white transition-colors z-50 focus:outline-none"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  {selectedFile.fileType.includes("image") ? (
                    <img 
                      src={safeUrl(selectedFile.url)} 
                      alt={selectedFile.name} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                    />
                  ) : selectedFile.fileType.includes("video") ? (
                    <video 
                      className="max-w-full max-h-full rounded-2xl shadow-2xl" 
                      controls 
                      autoPlay 
                      playsInline
                    >
                      <source src={safeUrl(selectedFile.url)} type={selectedFile.fileType} />
                    </video>
                  ) : (
                    <div className="bg-slate-900 p-20 rounded-[40px] border border-white/10 flex flex-col items-center gap-8">
                       <FileText className="w-32 h-32 text-blue-400" />
                       <h4 className="text-3xl font-bold">{selectedFile.name}</h4>
                       <a 
                        href={selectedFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-10 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-gray-200 transition-colors"
                       >
                         Download Document <ExternalLink className="w-5 h-5" />
                       </a>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-bold">{selectedFile.name}</h4>
                    <p className="text-sm opacity-50 uppercase tracking-widest font-bold">Source ID: {selectedFile.fileType}</p>
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      Open Original <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
