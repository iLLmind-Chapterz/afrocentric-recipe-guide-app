import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles, Loader2, Wheat, Drumstick, Leaf } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function MealPlanner() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any[]>([]);
  const [diet, setDiet] = useState('Standard');

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a 3-day premium Nigerian meal plan for a "${diet}" diet. For each day, provide breakfast, lunch, and dinner. Include the dish name and a brief high-end description. Return it as a JSON array of objects, where each object is a day.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                meals: {
                  type: Type.OBJECT,
                  properties: {
                    breakfast: { type: Type.STRING },
                    lunch: { type: Type.STRING },
                    dinner: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      setPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[40px] border-border-dark mt-12 bg-gradient-to-br from-gold/5 to-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-3xl font-serif italic text-white flex items-center gap-3">
            <Sparkles className="text-gold" />
            Onion AI <span className="inline-block" style={{ filter: 'hue-rotate(100deg) saturate(2)' }}>🧅</span> Planner
          </h3>
          <p className="text-gray-500 text-sm font-light mt-2">Personalized weekly culinary architecture.</p>
        </div>

        <div className="flex gap-2">
          {['Standard', 'Vegetarian', 'Keto'].map(d => (
            <button
              key={d}
              onClick={() => setDiet(d)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                diet === d ? 'bg-gold text-black' : 'bg-black/20 text-gray-500 border border-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {!plan.length && !loading && (
        <div className="text-center py-16">
          <button 
            onClick={generatePlan}
            className="group relative px-12 py-5 bg-terracotta text-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-terracotta/20"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <span className="relative flex items-center gap-3">
              <Sparkles size={16} />
              Architect My Menu
            </span>
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="mx-auto text-gold animate-spin mb-6" size={48} />
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Syncing with Tradition...</p>
        </div>
      )}

      <AnimatePresence>
        {plan.length > 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {plan.map((d, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-black/40 rounded-[32px] border border-border-dark relative group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Calendar size={80} />
                </div>
                <h4 className="text-gold font-serif italic text-2xl mb-8 border-b border-gold/10 pb-4">{d.day}</h4>
                <div className="space-y-6">
                  <MealRow label="Dawn" dish={d.meals.breakfast} icon={<Leaf size={14} className="text-deep-green" />} />
                  <MealRow label="Noon" dish={d.meals.lunch} icon={<Drumstick size={14} className="text-terracotta" />} />
                  <MealRow label="Dusk" dish={d.meals.dinner} icon={<Wheat size={14} className="text-gold" />} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MealRow({ label, dish, icon }: { label: string, dish: string, icon: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
      </div>
      <p className="text-sm font-medium text-white leading-snug">{dish}</p>
    </div>
  );
}
