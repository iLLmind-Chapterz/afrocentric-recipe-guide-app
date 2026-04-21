import { motion } from 'framer-motion';
import { Clock, Users, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    tribe: string;
    cookingTime: number;
    occasion: string;
    isPremium: boolean;
    imageUrl: string;
  };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-dark-surface rounded-2xl overflow-hidden border border-border-dark hover:border-gold/30 transition-all group shadow-2xl"
    >
      <Link to={`/recipe/${recipe.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.title}/800/600`}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 recipe-gradient" />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1.5 rounded border border-white/10 w-fit">
              {recipe.tribe}
            </span>
            {recipe.isPremium && (
              <span className="bg-gold text-black text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1.5 rounded shadow-lg w-fit">
                Premium
              </span>
            )}
          </div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-terracotta text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{recipe.occasion}</p>
            <h3 className="text-white text-2xl font-serif italic mb-3 leading-tight group-hover:text-gold transition-colors">{recipe.title}</h3>
            <div className="flex items-center gap-6 text-gray-400 text-[11px] font-medium tracking-wide">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-gold opacity-70" />
                {recipe.cookingTime} MINS
              </span>
              <div className="w-1 h-1 rounded-full bg-border-dark" />
              <span className="flex items-center gap-2 uppercase">
                {recipe.tribe} Staple
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
