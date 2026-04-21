import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import RecipeCard from '../components/RecipeCard';
import { Search, Filter, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';

import FlavorScout from '../components/FlavorScout';

const TRIBES = ['All', 'Yoruba', 'Igbo', 'Hausa', 'General'];
const OCCASIONS = ['All', 'Owambe', 'Casual', 'Breakfast'];

export default function Home() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [featuredRecipe, setFeaturedRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTribe, setSelectedTribe] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setSearchTerm(qParam);
      // Scroll to filters
      const filterSection = document.getElementById('search-filters');
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      try {
        const q = collection(db, 'recipes');
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(fetchedRecipes);
        if (fetchedRecipes.length > 0) {
          setFeaturedRecipe(fetchedRecipes[Math.floor(Math.random() * fetchedRecipes.length)]);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
      setLoading(false);
    }
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTribe = selectedTribe === 'All' || recipe.tribe === selectedTribe;
    const matchesOccasion = selectedOccasion === 'All' || recipe.occasion === selectedOccasion;
    return matchesSearch && matchesTribe && matchesOccasion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-gold/5 text-gold border border-gold/20 px-4 py-2 rounded-full mb-6 font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          <UtensilsCrossed size={14} />
          Welcome to Green Onion <span className="inline-block" style={{ filter: 'hue-rotate(100deg) saturate(2)' }}>🧅</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif mb-6 text-white leading-tight italic"
        >
          Taste the Heart of <br />
          <span className="text-terracotta italic">Motherland</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto text-lg font-light leading-relaxed"
        >
          Discover authentic recipes from across Nigeria. From bustling Owambes to cozy family dinners, master the art of Afro-fusion.
        </motion.p>
      </section>

      {/* AI Flavor Scout */}
      <FlavorScout />

      {/* Featured Culinary Heritage */}
      <AnimatePresence>
        {featuredRecipe && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-8">
               <div className="w-8 h-1 bg-gold rounded-full" />
               <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500">Heritage Spotlight</h3>
            </div>
            
            <Link to={`/recipe/${featuredRecipe.id}`} className="group block relative h-[400px] rounded-[40px] overflow-hidden border border-border-dark shadow-2xl">
              <img 
                src={featuredRecipe.imageUrl || `https://picsum.photos/seed/${featuredRecipe.title}/1200/800`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                alt={featuredRecipe.title}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div>
                  <span className="text-gold font-bold text-xs uppercase tracking-[0.3em] mb-3 block">{featuredRecipe.tribe} • {featuredRecipe.occasion}</span>
                  <h2 className="text-white text-5xl md:text-7xl font-serif italic mb-4 group-hover:translate-x-2 transition-transform">{featuredRecipe.title}</h2>
                  <p className="text-gray-400 max-w-lg text-sm font-light leading-relaxed">Experience a dish steeped in generations of tradition, rearchitected for the modern chef.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-black hover:scale-110 transition-all font-bold">
                   GO
                </div>
              </div>
            </Link>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <section id="search-filters" className="mb-16 sticky top-24 z-30">
        <div className="glass p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search recipes (e.g. Jollof)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-black/40 rounded-xl border border-border-dark focus:border-gold/30 focus:ring-0 transition-all text-white placeholder:text-gray-600"
            />
          </div>
          
          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide border border-border-dark">
            {TRIBES.map(tribe => (
              <button
                key={tribe}
                onClick={() => setSelectedTribe(tribe)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedTribe === tribe 
                  ? 'bg-terracotta text-white shadow-lg' 
                  : 'text-gray-500 hover:text-white'
                }`}
              >
                {tribe}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl w-full md:w-auto overflow-x-auto whitespace-nowrap scrollbar-hide border border-border-dark">
            {OCCASIONS.map(occasion => (
              <button
                key={occasion}
                onClick={() => setSelectedOccasion(occasion)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
                  selectedOccasion === occasion 
                  ? 'border-gold text-gold bg-gold/5' 
                  : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-green mb-4" />
            <p className="text-stone-500 font-medium">Fetching the flavors...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
            <p className="text-stone-400 text-lg font-serif">Oops! No recipes found for your selection.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedTribe('All'); setSelectedOccasion('All')}}
              className="mt-4 text-deep-green font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
