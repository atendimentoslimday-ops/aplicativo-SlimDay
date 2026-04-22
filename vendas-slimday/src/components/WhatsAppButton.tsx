import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppButton = () => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    {/* Tooltip/Label */}
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 text-[10px] font-black uppercase tracking-[2px] text-slate-600 mb-1"
    >
      Dúvidas? <span className="text-primary">Fale Comigo</span>
    </motion.div>

    <motion.a
      href="https://wa.me/5531998798876"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative group"
    >
      {/* Pulse effect */}
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity" />
      
      <div className="relative bg-[#25D366] text-white p-5 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#22c35e] transition-colors border-2 border-white/20">
        <MessageCircle className="w-8 h-8 fill-current" />
      </div>
    </motion.a>
  </div>
);

export default WhatsAppButton;
