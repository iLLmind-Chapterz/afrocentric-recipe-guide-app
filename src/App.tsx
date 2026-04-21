import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import { seedBaseData } from './lib/seed';
import { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    // Seed data on first load
    seedBaseData();
  }, []);

  useEffect(() => {
    // Sync user data to Firestore
    const syncUser = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        // Bootstrap admin role for specific email
        const isAdminEmail = user.email === 'chapterztheorator@gmail.com';
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: isAdminEmail ? 'admin' : 'user',
            isPremium: isAdminEmail ? true : false, // Admins get premium for free
            savedRecipes: [],
            createdAt: serverTimestamp()
          });
          
          if (isAdminEmail) {
            // Also add to admins collection for security rules
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email,
              addedAt: serverTimestamp()
            });
          }
        }
      }
    };
    syncUser();
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Navbar />
        <main className="pt-24 pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/saved" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/premium" element={<div className="text-center mt-20 text-stone-600 max-w-2xl mx-auto px-4"><h1 className="text-3xl mb-4 text-white font-serif italic">Premium Membership</h1>Elevate your cooking with 50+ exclusive recipes, cultural storytelling, and advanced meal planning for ₦2,500/month.</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

