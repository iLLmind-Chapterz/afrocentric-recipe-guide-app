import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, orderBy, limit, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle, 
  TrendingUp,
  LayoutDashboard,
  ChefHat,
  Trash
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import React from 'react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'recipes' | 'transactions'>('overview');
  const [recipes, setRecipes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalRecipes: 0
  });

  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);
      try {
        // Fetch Recipes
        const recipeSnap = await getDocs(query(collection(db, 'recipes'), orderBy('title')));
        const recipeList = recipeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipeList);

        // Fetch Transactions
        const transSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
        const transList: any[] = transSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(transList);

        // Fetch Users (Count)
        const userSnap = await getDocs(collection(db, 'users'));
        
        const revenue = transList.reduce((acc, curr) => acc + (curr.status === 'success' ? curr.amount : 0), 0);

        setStats({
          totalRevenue: revenue,
          totalUsers: userSnap.size,
          totalRecipes: recipeSnap.size
        });
      } catch (error) {
        console.error("Admin data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const deleteRecipe = async (id: string) => {
    if (!window.confirm("Permanently remove this culinary masterpiece?")) return;
    try {
      await deleteDoc(doc(db, 'recipes', id));
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.tribe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-white">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-terracotta mb-4">
             <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center border border-terracotta/20">
                <ChefHat size={20} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Command Center</span>
          </div>
          <h1 className="text-5xl font-serif italic">Green Onion <span className="inline-block" style={{ filter: 'hue-rotate(100deg) saturate(2)' }}>🧅</span> <span className="text-gold">Admin</span></h1>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-border-dark">
          {(['overview', 'recipes', 'transactions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-gold text-black' : 'text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard title="Total Revenue" value={`₦${stats.totalRevenue.toLocaleString()}`} icon={<CreditCard className="text-gold" />} trend="+12.5%" />
        <StatCard title="Active Chefs" value={stats.totalUsers.toString()} icon={<Users className="text-deep-green" />} trend="+5.2%" />
        <StatCard title="Flavor Library" value={stats.totalRecipes.toString()} icon={<BookOpen className="text-terracotta" />} trend="+2 new" />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 glass p-8 rounded-[40px] border-border-dark">
              <h3 className="text-xl font-serif italic text-gold mb-8">Revenue Momentum</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={transactions.map(t => ({ name: '', amount: t.amount })).reverse().slice(-10)}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F0F0F', border: '1px solid #2A2A2A', borderRadius: '12px' }}
                      itemStyle={{ color: '#D4AF37' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#D4AF37" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] border-border-dark">
               <h3 className="text-xl font-serif italic text-gold mb-8">Recent Subscriptions</h3>
               <div className="space-y-4">
                  {transactions.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-black/20 rounded-2xl border border-white/5">
                       <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mb-1">Elite Access</p>
                          <p className="text-xs font-bold font-mono">{t.reference.slice(0, 12).toUpperCase()}...</p>
                       </div>
                       <p className="text-xs font-bold text-gold">₦{t.amount.toLocaleString()}</p>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recipes' && (
          <motion.div 
            key="recipes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="relative mb-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
              <input 
                type="text" 
                placeholder="Search recipe catalog by title or tribe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-black/40 border border-border-dark rounded-2xl text-white focus:border-gold/30 focus:ring-0 transition-all font-light"
              />
            </div>

            <div className="bg-dark-surface rounded-[40px] border border-border-dark overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-black/40 border-b border-border-dark">
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Recipe</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Origin</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Access</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredRecipes.map((r) => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-6">
                              <p className="font-serif italic text-lg">{r.title}</p>
                           </td>
                           <td className="px-8 py-6 uppercase tracking-widest text-[10px] font-bold text-gray-400">{r.tribe}</td>
                           <td className="px-8 py-6">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                                r.isPremium ? 'bg-gold/10 text-gold' : 'bg-white/10 text-gray-400'
                              }`}>
                                 {r.isPremium ? 'Premium' : 'Public'}
                              </span>
                           </td>
                           <td className="px-8 py-6">
                              <button onClick={() => deleteRecipe(r.id)} className="p-2 text-gray-600 hover:text-terracotta transition-colors">
                                 <Trash size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div 
            key="transactions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
             <div className="relative mb-8">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
              <input 
                type="text" 
                placeholder="Search transaction vault by reference or user identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-black/40 border border-border-dark rounded-2xl text-white focus:border-gold/30 focus:ring-0 transition-all font-light"
              />
            </div>

            <div className="bg-dark-surface rounded-[40px] border border-border-dark overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-black/40 border-b border-border-dark">
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Reference</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Amount</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Status</th>
                        <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">Auth Signature</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredTransactions.map((t) => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-6 font-mono text-[11px] uppercase tracking-tighter text-gray-400">{t.reference}</td>
                           <td className="px-8 py-6 font-bold text-gold text-sm">₦{t.amount.toLocaleString()}</td>
                           <td className="px-8 py-6">
                              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                                t.status === 'success' ? 'text-deep-green' : 'text-gold'
                              }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'success' ? 'bg-deep-green' : 'bg-gold'}`} />
                                 {t.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-[10px] text-gray-600 font-mono">{t.userId.slice(0, 16)}...</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass p-8 rounded-[40px] border-border-dark relative group overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
         {icon}
      </div>
      <p className="text-[10px] uppercase font-bold text-gray-500 tracking-[0.3em] mb-4">{title}</p>
      <div className="flex items-baseline gap-4">
         <h4 className="text-4xl font-serif italic text-white leading-none">{value}</h4>
         <span className="text-[10px] font-bold text-deep-green bg-deep-green/10 px-2 py-0.5 rounded uppercase tracking-widest">{trend}</span>
      </div>
    </div>
  );
}
