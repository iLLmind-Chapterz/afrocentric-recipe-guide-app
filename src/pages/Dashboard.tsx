import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import RecipeCard from '../components/RecipeCard';
import { Heart, CreditCard, User, ChefHat, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import MealPlanner from '../components/MealPlanner';
import PantryScout from '../components/PantryScout';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      // Fetch User Profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        setUserData(uData);

        // Fetch Saved Recipes details
        if (uData.savedRecipes && uData.savedRecipes.length > 0) {
          const recipesCol = collection(db, 'recipes');
          // Firestore 'in' query has a limit of 10, but good for now
          const q = query(recipesCol, where('__name__', 'in', uData.savedRecipes.slice(0, 10)));
          const recipeSnaps = await getDocs(q);
          setSavedRecipes(recipeSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      }

      // Fetch Transactions
      const transCol = collection(db, 'transactions');
      const transQ = query(transCol, where('userId', '==', user.uid));
      const transSnaps = await getDocs(transQ);
      setTransactions(transSnaps.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setLoading(false);
    }

    fetchData();
  }, [user]);

  if (!user) return <div className="text-center mt-20 text-white">Please sign in to view your dashboard.</div>;
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-gold mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20">
              <Sparkles size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.3em]">Master Suite</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-serif text-white italic">
            Chef <span className="text-terracotta">{user.displayName?.split(' ')[0]}</span>'s Kitchen
          </h1>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
            <p className={`text-sm font-bold uppercase tracking-widest ${userData?.isPremium ? 'text-gold' : 'text-gray-400'}`}>
              {userData?.isPremium ? 'Premium' : 'Standard'}
            </p>
          </div>
          <div className="glass px-6 py-4 rounded-2xl text-center min-w-[120px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Recipes</p>
            <p className="text-sm font-bold text-white uppercase tracking-widest">{userData?.savedRecipes?.length || 0}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-12 text-white">
        {/* Saved Recipes Section */}
        <div className="lg:col-span-2 space-y-12">
          {/* Pantry Scout (New Discovery Feature) */}
          <section>
            <PantryScout />
          </section>

          <div className="flex justify-between items-center bg-dark-surface/50 p-6 rounded-[32px] border border-border-dark">
            <h2 className="text-2xl font-serif italic flex items-center gap-3">
              <Heart className="text-terracotta" />
              Saved Masterpieces
            </h2>
            <Link to="/saved" className="text-xs font-bold text-gold uppercase tracking-widest hover:underline">View all</Link>
          </div>

          {savedRecipes.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-8">
              {savedRecipes.map(recipe => (
                <motion.div 
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-[40px] border-dashed">
              <p className="text-gray-500 italic mb-6">Your collection is empty. Start your culinary journey.</p>
              <Link to="/" className="inline-block bg-terracotta text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Explore Recipes</Link>
            </div>
          )}
        </div>

        {/* Sidebar: Profile & Transactions */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="glass p-8 rounded-[40px] border-border-dark shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <ChefHat size={120} />
             </div>
             <h3 className="text-xl font-serif italic text-gold mb-6 border-b border-gold/10 pb-4">Personal Details</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center text-gray-500">
                      <User size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Full Name</p>
                      <p className="font-bold">{user.displayName}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center text-gray-500">
                      <CreditCard size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Membership</p>
                      <p className="font-bold text-gold uppercase text-xs tracking-widest">
                        {userData?.isPremium ? 'Elite Member' : 'Guest Member'}
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Transaction History */}
          <div className="glass p-8 rounded-[40px] border-border-dark shadow-2xl">
            <h3 className="text-xl font-serif italic text-gold mb-6 border-b border-gold/10 pb-4">Transaction Vault</h3>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-border-dark/50">
                    <div>
                      <p className="text-xs font-bold text-white tracking-wide">₦{t.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 tracking-tight uppercase">{t.reference.toUpperCase()}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      t.status === 'success' ? 'bg-deep-green/20 text-deep-green' : 'bg-gold/10 text-gold'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm text-center py-4">No recent payments records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {userData?.isPremium && <MealPlanner />}
    </div>
  );
}
