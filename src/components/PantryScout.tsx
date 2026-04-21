import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Sparkles, Loader2, ArrowRight, Wheat, ChefHat } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function PantryScout() {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const scoutRecipes = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have these ingredients: ${ingredients}. Suggest 3 authentic Nigerian recipes I can make or almost make. For each, give me the name, a "Compatibility" percentage, and what's missing if anything. Return as JSON array of objects.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                recipe: { type: Type.STRING },
                compatibility: { type: Type.NUMBER },
                missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      setSuggestions(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[40px] border-border-dark bg-gradient-to-tr from-deep-green/5 to-transparent">
      <div className="mb-10">
        <h3 className="text-3xl font-serif italic text-white flex items-center gap-3">
          <ShoppingBag className="text-deep-green" />
          Pantry <span className="text-deep-green">Scout</span>
        </h3>
        <p className="text-gray-500 text-sm font-light mt-2">Inventory-aware recipe discovery powered by AI.</p>
      </div>

      <div className="relative mb-8">
        <textarea
          placeholder="e.g. Yam, Palm Oil, Crayfish, Onions, Salt..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full bg-black/40 border border-border-dark rounded-2xl py-6 px-8 text-white focus:border-deep-green focus:ring-0 transition-all font-light resize-none h-32"
        />
        <button 
          onClick={scoutRecipes}
          disabled={loading || !ingredients.trim()}
          className="absolute bottom-4 right-4 bg-deep-green text-white p-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-30 disabled:pointer-events-none"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6"
          >
            {suggestions.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-black/40 border border-white/5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-deep-green/30 transition-all"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-deep-green bg-deep-green/10 px-2 py-1 rounded-lg uppercase tracking-widest">{s.compatibility}% Match</span>
                    <h4 className="text-xl font-serif italic text-white">{s.recipe}</h4>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{s.description}</p>
                  
                  {s.missing.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Missing:</span>
                       {s.missing.map((item: string, j: number) => (
                         <span key={j} className="text-[10px] bg-terracotta/10 text-terracotta px-2 py-0.5 rounded border border-terracotta/20">{item}</span>
                       ))}
                     </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full border border-border-dark flex items-center justify-center text-gray-500 group-hover:bg-deep-green group-hover:text-black transition-all">
                      <ArrowRight size={20} />
                   </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
