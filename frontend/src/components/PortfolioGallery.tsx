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

  if (!files || files.length === 0) return null;

  return (
    <section className="mb-40">
      <h3 className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40 mb-12 flex items-center gap-4">
        <span className="h-[1px] w-12 bg-white/20" />
        Selected Case Studies
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {files.map((file, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`group relative rounded-[40px] overflow-hidden ${theme.card} transition-all duration-500 cursor-pointer`}
            onClick={() => setSelectedFile(file)}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              {file.fileType.includes("image") ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : file.fileType.includes("video") ? (
                <div className="relative w-full h-full">
                  <video 
                    src={file.url} 
                    className="w-full h-full object-cover" 
                    muted 
                    loop 
                    playsInline
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 gap-4">
                  <FileText className="w-16 h-16 opacity-20" />
                  <span className="text-xs font-bold opacity-30 uppercase tracking-widest">{file.name}</span>
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-8 text-center backdrop-blur-sm">
                 <div className="p-3 rounded-full bg-white/10 border border-white/20">
                    <ZoomIn className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="font-bold text-lg leading-tight">{file.name}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60 mt-2">Click to expand</p>
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
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
                className="absolute top-0 right-0 p-4 text-white/60 hover:text-white transition-colors z-50"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="w-full h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  {selectedFile.fileType.includes("image") ? (
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.name} 
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                    />
                  ) : selectedFile.fileType.includes("video") ? (
                    <video 
                      src={selectedFile.url} 
                      className="max-w-full max-h-full rounded-2xl shadow-2xl" 
                      controls 
                      autoPlay 
                      playsInline
                    />
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
                  <div>
                    <h4 className="text-2xl font-bold">{selectedFile.name}</h4>
                    <p className="text-sm opacity-50">High-resolution asset delivery</p>
                  </div>
                  <div className="flex gap-4">
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
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
