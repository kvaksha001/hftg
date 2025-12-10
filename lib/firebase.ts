import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Blockchain trades collection
export async function saveBlockchainTrade(
  playerAddress: string,
  signature: string,
  tradeData: {
    type: 'BUY' | 'SELL';
    amount: number;
    price: number;
    profit: number;
    timestamp: number;
  }
) {
  try {
    await addDoc(collection(db, 'blockchain_trades'), {
      playerAddress,
      signature,
      ...tradeData,
      verifiedAt: new Date(),
      chainId: 'devnet',
    });
  } catch (error) {
    console.error('Save blockchain trade error:', error);
  }
}

export async function getBlockchainTrades(playerAddress: string) {
  try {
    const q = query(
      collection(db, 'blockchain_trades'),
      where('playerAddress', '==', playerAddress),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Get blockchain trades error:', error);
    return [];
  }
}
