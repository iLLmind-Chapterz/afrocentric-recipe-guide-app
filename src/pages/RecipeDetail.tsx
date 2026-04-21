import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, ChefHat, Users, CheckCircle2, Lock, Heart, Sparkles, Loader2, X } from 'lucide-react';
import PaymentButton from '../components/PaymentButton';
import { GoogleGenAI } from "@google/genai";

import RecipeComments from '../components/RecipeComments';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [wisdom, setWisdom] = useState('');
  const [wisdomLoading, setWisdomLoading] = useState(false);
  const [cookingStep, setCookingStep] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      if (!id) return;
      const docRef = doc(db, 'recipes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRecipe({ id: docSnap.id, ...data });
        fetchCulturalWisdom(data.title, data.tribe);
      }
      setLoading(false);
    }

    async function checkUserStats() {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const uData = userSnap.data();
          setIsPremiumUser(uData.isPremium || false);
          setIsSaved(uData.savedRecipes?.includes(id) || false);
        }
      }
    }

    fetchRecipe();
    checkUserStats();
  }, [id]);

  const fetchCulturalWisdom = async (title: string, tribe: string) => {
    setWisdomLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a short, 2-sentence "Cultural Wisdom" or historical insight about the dish "${title}" from the ${tribe} tribe or Nigeria in general. Make it sound sophisticated and proud.`,
      });
      setWisdom(response.text || '');
    } catch (error) {
      console.error("Wisdom failed:", error);
    } finally {
      setWisdomLoading(false);
    }
  };

  const toggleSave = async () => {
    if (!auth.currentUser || !id) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      if (isSaved) {
        await updateDoc(userRef, { savedRecipes: arrayRemove(id) });
        setIsSaved(false);
      } else {
        await updateDoc(userRef, { savedRecipes: arrayUnion(id) });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Toggle save failed:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;
  if (!recipe) return <div className="text-center mt-20 text-white font-serif">Recipe missing in the vault.</div>;

  const showContent = !recipe.isPremium || isPremiumUser;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gold hover:opacity-70 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          BACK TO COLLECTIONS
        </button>
        
        {auth.currentUser && (
          <button 
            onClick={toggleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-all ${
              isSaved ? 'bg-terracotta border-terracotta text-black' : 'border-gold/30 text-gold hover:bg-gold/5'
            }`}
          >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? 'SAVED' : 'SAVE TO KITCHEN'}
          </button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-surface rounded-[40px] overflow-hidden border border-border-dark shadow-2xl relative"
      >
        <div className="relative h-[600px]">
          <img 
            src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.title}/1200/800`}
            alt={recipe.title}
            className="w-full h-full object-cover grayscale-[20%]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
            <div className="max-w-2xl">
              <span className="text-terracotta font-bold text-sm uppercase tracking-[0.3em] mb-4 block">
                {recipe.tribe} Staple • {recipe.occasion}
              </span>
              <h1 className="text-white text-6xl md:text-8xl font-serif leading-tight italic">{recipe.title}</h1>
              
              {/* Cultural Wisdom AI Section */}
              <div className="mt-8 relative max-w-lg">
                 <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gold/20 rounded-full" />
                 {wisdomLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 animate-pulse">
                      <Sparkles size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Consulting Oral Traditions...</span>
                    </div>
                 ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-400 italic text-sm font-light leading-relaxed"
                    >
                      <Sparkles className="text-gold mb-1" size={14} />
                      {wisdom}
                    </motion.div>
                 )}
              </div>
            </div>
            
            <div className="hidden lg:flex flex-col items-end gap-6">
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-gold/40 items-center justify-center p-2 rotate-12">
                <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-center p-6 border border-white/5">
                  <p className="text-[10px] uppercase text-gold tracking-widest leading-relaxed font-bold">
                    Chef's Secret: Authentic {recipe.tribe} technique
                  </p>
                </div>
              </div>
              {showContent && (
                <button 
                  onClick={() => setCookingStep(0)}
                  className="bg-gold text-black px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all shadow-xl font-bold uppercase tracking-widest text-xs"
                >
                  <Sparkles size={16} />
                  Start Cooking
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-12 lg:p-20">
          <div className="flex flex-wrap gap-12 mb-20 border-b border-border-dark pb-12">
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Time</span>
              <span className="text-xl font-bold tracking-tight text-white">{recipe.cookingTime}M</span>
            </div>
            <div className="w-[1px] h-10 bg-border-dark" />
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Servings</span>
              <span className="text-xl font-bold tracking-tight text-white">6 People</span>
            </div>
            <div className="w-[1px] h-10 bg-border-dark" />
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 block">Difficulty</span>
              <span className="text-xl font-bold tracking-tight text-terracotta uppercase italic">Master</span>
            </div>
          </div>

          {!showContent ? (
            <div className="relative overflow-hidden rounded-[40px] p-1 shadow-2xl">
              <div className="absolute inset-0 bg-gold/10 animate-pulse" />
              <div className="glass relative z-10 p-16 lg:p-24 text-center rounded-[38px]">
                <div className="w-20 h-20 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-8 border border-gold/20">
                  <Lock className="text-gold" size={32} />
                </div>
                <h2 className="text-4xl font-serif mb-6 text-white italic">Premium Secret Instructions</h2>
                <p className="text-gray-400 mb-12 max-w-lg mx-auto text-lg font-light leading-relaxed">
                  Unlock the authentic smoky flavor technique used by Nigerian party caterers. Master the secrets of the masters.
                </p>
                <div className="max-w-md mx-auto">
                  {auth.currentUser ? (
                    <PaymentButton 
                      amount={2500} 
                      email={auth.currentUser.email || ''} 
                      onSuccess={() => navigate(0)}
                      onClose={() => {}}
                    />
                  ) : (
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full bg-terracotta text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all"
                    >
                      Sign In to Unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-20">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-bold mb-10 italic text-gold border-b border-gold/20 pb-4 inline-block">
                  The Ingredients
                </h2>
                <ul className="space-y-6">
                  {recipe.ingredients.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-gray-300 group">
                      <div className="w-2 h-2 rounded-full bg-terracotta group-hover:scale-150 transition-transform" />
                      <span className="text-lg font-light tracking-wide">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="lg:col-span-8">
                <h2 className="text-2xl font-bold mb-10 italic text-gold border-b border-gold/20 pb-4 inline-block">
                  Master Preparation
                </h2>
                <div className="space-y-12">
                  {recipe.instructions.map((step: string, i: number) => (
                    <div key={i} className="flex gap-10 group">
                      <div className="shrink-0 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full border border-border-dark text-stone-500 flex items-center justify-center font-serif text-lg italic group-hover:border-gold group-hover:text-gold transition-colors">
                          {i + 1}
                        </div>
                        {i < recipe.instructions.length - 1 && (
                          <div className="w-[1px] h-full bg-border-dark my-4" />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className="text-gray-300 text-lg leading-relaxed font-light">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {id && <RecipeComments recipeId={id} />}
      </motion.div>
      
      <footer className="mt-20 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-dark-surface border border-border-dark rounded-full text-[10px] uppercase tracking-widest text-gray-400">Recipe ID: NF-{recipe.id.slice(0,4).toUpperCase()}</span>
          <span className="px-4 py-2 bg-dark-surface border border-border-dark rounded-full text-[10px] uppercase tracking-widest text-gray-400">Verified Chef Content</span>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">© 2026 GREEN ONION <span className="inline-block" style={{ filter: 'hue-rotate(100deg) saturate(2)' }}>🧅</span>. MADE WITH PRIDE.</p>
      </footer>

      {/* Modern Cooking Mode Overlay */}
      <AnimatePresence>
        {cookingStep !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-bg flex flex-col"
          >
            <div className="p-8 flex justify-between items-center border-b border-border-dark">
              <div>
                <p className="text-gold font-bold text-[10px] uppercase tracking-[0.4em] mb-1">Cooking Mode</p>
                <h4 className="text-2xl font-serif italic text-white">{recipe.title}</h4>
              </div>
              <button 
                onClick={() => setCookingStep(null)}
                className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center text-white hover:bg-terracotta hover:text-black transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row">
              <div className="hidden md:block w-1/3 border-r border-border-dark p-12 overflow-y-auto">
                <h5 className="text-gold uppercase text-[10px] font-bold tracking-widest mb-10">Ingredients List</h5>
                <ul className="space-y-6">
                  {recipe.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="flex gap-4 items-start text-gray-500 text-sm italic">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-gold/20" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 p-12 md:p-24 flex flex-col justify-center max-w-4xl mx-auto">
                <div className="mb-20">
                  <span className="text-terracotta font-serif italic text-4xl mb-4 block">Step {cookingStep + 1} of {recipe.instructions.length}</span>
                  <motion.p 
                    key={cookingStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white text-3xl md:text-5xl font-light leading-tight italic"
                  >
                    "{recipe.instructions[cookingStep]}"
                  </motion.p>
                </div>

                <div className="flex gap-6">
                  <button 
                    disabled={cookingStep === 0}
                    onClick={() => setCookingStep(prev => prev! - 1)}
                    className="flex-1 py-5 border border-border-dark rounded-2xl font-bold uppercase tracking-widest text-gray-500 hover:border-gold hover:text-gold disabled:opacity-20 disabled:pointer-events-none transition-all"
                  >
                    Previous
                  </button>
                  {cookingStep < recipe.instructions.length - 1 ? (
                    <button 
                      onClick={() => setCookingStep(prev => prev! + 1)}
                      className="flex-1 py-5 bg-gold text-black rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCookingStep(null)}
                      className="flex-1 py-5 bg-terracotta text-black rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                      Finish Dish
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-black/40 border-t border-border-dark">
                <div className="h-1 bg-border-dark w-full rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((cookingStep + 1) / recipe.instructions.length) * 100}%` }}
                    className="h-full bg-gold"
                   />
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
