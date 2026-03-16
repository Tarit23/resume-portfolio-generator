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
    // Cloudinary URLs are already encoded by the SDK.
    // We only need to escape naked parentheses if they are being used in a CSS context,
    // but for <img> and <video> src, the raw URL from Cloudinary is usually perfect.
    return url;
  };

  if (!files || files.length === 0) return null;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group relative rounded-3xl overflow-hidden ${theme.card} transition-all duration-500 cursor-pointer ${isFeature ? 'md:col-span-2 aspect-video' : 'aspect-[16/10]'}`}
              onClick={() => setSelectedFile(file)}
            >
              {isFeature && isVideo && (
                <div className="absolute top-6 left-6 z-20 px-3 py-1 bg-[#F59E0B] text-black text-[10px] font-black tracking-widest uppercase rounded">
                  Demo Reel
                </div>
              )}

              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
                   <Zap className="w-8 h-8 opacity-20 animate-bounce" />
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 gap-2 p-6 text-center">
                   <X className="w-8 h-8 text-red-400 opacity-50" />
                   <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Load Failed</div>
                   <a 
                    href={file.url} 
                    target="_blank" 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold hover:bg-white/10 transition-colors"
                   >
                     View Original ↗
                   </a>
                </div>
              )}

              <div className="w-full h-full relative overflow-hidden">
                {isImage ? (
                  <img 
                    src={url} 
                    alt={file.name} 
                    onLoad={() => handleMediaLoad(file.url)}
                    onError={() => handleMediaError(file.url)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                  />
                ) : isVideo ? (
                  <div className="relative w-full h-full">
                    <video 
                      className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                      muted 
                      loop 
                      playsInline
                      autoPlay
                      preload="auto"
                      onCanPlay={() => handleMediaLoad(file.url)}
                      onError={() => handleMediaError(file.url)}
                    >
                      <source src={url} type={file.fileType} />
                    </video>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-white text-white ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 gap-4">
                    <FileText className="w-16 h-16 opacity-10" />
                    <span className="text-xs font-bold opacity-30 uppercase tracking-widest truncate max-w-[80%] px-4">{file.name}</span>
                  </div>
                )}
                
                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                   <p className="font-bold text-lg leading-tight truncate">{file.name}</p>
                   <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Click to expand</p>
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
