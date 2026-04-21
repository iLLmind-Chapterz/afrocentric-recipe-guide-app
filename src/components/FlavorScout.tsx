import { GoogleGenAI, Type } from "@google/genai";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChefHat, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function FlavorScout() {
  const [ingredients, setIngredients] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const scoutRecipes = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have these ingredients: ${ingredients}. Based on traditional Nigerian cuisine (Yoruba, Igbo, Hausa), suggest 3 recipes that use these ingredients primarily. Provide the recipe name, a short description, and how it relates to the ingredients I have.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                matchReason: { type: Type.STRING },
                tribe: { type: Type.STRING }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      setSuggestions(result);
    } catch (error) {
      console.error("Scout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[40px] border-border-dark my-20 relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 bg-gold/5 w-64 h-64 rounded-full blur-3xl pointer-events-none group-hover:bg-gold/10 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/3">
          <div className="bg-gold/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-gold/20 mb-6">
            <Sparkles className="text-gold" size={32} />
          </div>
          <h2 className="text-3xl font-serif italic text-white mb-4 leading-tight">AI Flavor <br /><span className="text-gold">Scout</span></h2>
          <p className="text-gray-400 font-light leading-relaxed text-sm mb-6">
            Tell us what's in your pantry, and our AI chef will suggest traditional masterpieces you can craft right now.
          </p>
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <ChefHat size={14} className="text-terracotta" />
                African Culinary Intelligence
             </div>
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Enter ingredients (e.g., Yam, Pepper, Palm Oil)..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && scoutRecipes()}
              className="w-full bg-black/40 border border-border-dark py-6 px-8 rounded-2xl text-white placeholder:text-gray-600 focus:border-gold/30 focus:ring-0 transition-all pr-32"
            />
            <button 
              onClick={scoutRecipes}
              disabled={loading}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-gold text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              Scout
            </button>
          </div>

          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid sm:grid-cols-3 gap-6"
              >
                {suggestions.map((s, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 bg-dark-surface rounded-3xl border border-border-dark hover:border-gold/20 transition-all"
                  >
                    <span className="text-[10px] font-bold text-terracotta uppercase tracking-[0.2em] mb-2 block">{s.tribe}</span>
                    <h4 className="text-lg font-serif italic text-white mb-2">{s.name}</h4>
                    <p className="text-xs text-gray-500 font-light mb-4 line-clamp-2">{s.description}</p>
                    <p className="text-[10px] text-gold font-bold italic mb-6">" {s.matchReason} "</p>
                    <Link 
                      to={`/?q=${s.name}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest hover:text-gold transition-colors"
                    >
                      Find Recipe <ArrowRight size={14} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
