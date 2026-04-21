import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface PaymentButtonProps {
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export default function PaymentButton({ amount, onSuccess }: PaymentButtonProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateSuccess = async () => {
    setIsSimulating(true);
    // Simulate a brief delay for "processing"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const reference = 'REF-' + Date.now().toString().slice(-6);
    
    if (auth.currentUser) {
      // 1. Log transaction
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser.uid,
        reference,
        amount,
        status: 'success',
        type: 'demo_unlock',
        createdAt: serverTimestamp(),
      });

      // 2. Actually update user status for demo
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        isPremium: true
      });
    }

    setIsSimulating(false);
    onSuccess(reference);
  };

  return (
    <button
      onClick={simulateSuccess}
      disabled={isSimulating}
      className="group relative flex items-center justify-center gap-3 w-full bg-gold text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
    >
      {isSimulating ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-t-2 border-black rounded-full animate-spin" />
          Authenticating...
        </div>
      ) : (
        <>
          <Sparkles size={20} className="animate-pulse" />
          Unlock Master Suite (Demo)
        </>
      )}
    </button>
  );
}
