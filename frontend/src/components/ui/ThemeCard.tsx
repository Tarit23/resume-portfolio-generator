"use client";

import { motion } from "framer-motion";
import React from "react";

interface ThemeCardProps {
  title: string;
  description: string;
  gradient: string;
  selected: boolean;
  onClick: () => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ title, description, gradient, selected, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-1 relative overflow-hidden transition-all ${selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-white/10'}`}
    >
      <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${gradient}`} />
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-xl p-6 h-full border border-white/5 relative z-10">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
        
        {selected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
