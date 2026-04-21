import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, Sparkles } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function RecipeComments({ recipeId }: { recipeId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const q = query(
        collection(db, 'comments'),
        where('recipeId', '==', recipeId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
    };
    fetchComments();
  }, [recipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    setLoading(true);
    try {
      const docData = {
        recipeId,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous Chef',
        text: newComment,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'comments'), docData);
      setComments([{ id: docRef.id, ...docData, createdAt: new Date() } as Comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-20 border-t border-border-dark pt-16">
      <div className="flex items-center gap-3 mb-12">
        <MessageSquare className="text-gold" />
        <h3 className="text-3xl font-serif italic text-white leading-none">Kitchen <span className="text-gold">Chatter</span></h3>
      </div>

      {auth.currentUser ? (
        <form onSubmit={handleSubmit} className="mb-16 relative">
          <input
            type="text"
            placeholder="Share your culinary triumph or tip..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-black/40 border border-border-dark rounded-2xl py-6 pl-8 pr-20 text-white focus:border-gold transition-all font-light"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold p-4 rounded-xl text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-gold/20"
          >
            {loading ? <div className="w-5 h-5 border-t-2 border-black rounded-full animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      ) : (
        <div className="p-10 bg-black/20 border border-white/5 rounded-[32px] text-center mb-16 underline hover:text-gold cursor-pointer" onClick={() => {/* auth trigger */}}>
           Sign in to join the conversation.
        </div>
      )}

      <div className="space-y-8">
        <AnimatePresence initial={false}>
          {comments.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-6 group"
            >
              <div className="w-12 h-12 rounded-full bg-border-dark flex items-center justify-center text-stone-500 group-hover:bg-gold group-hover:text-black transition-all shadow-inner">
                <User size={20} />
              </div>
              <div className="flex-1 pb-8 border-b border-white/[0.03]">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gold">{c.userName}</h4>
                  <span className="text-[9px] text-gray-500 uppercase font-mono">{c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                </div>
                <p className="text-gray-400 font-light leading-relaxed">{c.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <div className="text-center py-20 text-gray-600 italic">
             No whispers in the kitchen yet. Be the first to speak.
          </div>
        )}
      </div>
    </div>
  );
}
