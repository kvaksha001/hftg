'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = 'hftg2025'; // Смени на свой!

  const loadScores = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'scores'));
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.()?.toLocaleString() || 'N/A'
      }));
      setScores(data);
    } catch (error) {
      console.error('Error loading scores:', error);
    }
    setLoading(false);
  };

  const deleteScore = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    try {
      await deleteDoc(doc(db, 'scores', id));
      alert('✅ Deleted!');
      loadScores();
    } catch (error) {
      alert('Error deleting score');
    }
  };

  const clearAll = async () => {
    if (!confirm('⚠️ DELETE ALL SCORES? This cannot be undone!')) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'scores'));
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      alert('✅ All scores deleted!');
      loadScores();
    } catch (error) {
      alert('Error clearing scores');
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      loadScores();
    } else {
      alert('Wrong password!');
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-6">🔒 Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-blue-500 focus:outline-none mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg text-white font-bold transition"
          >
            Login
          </button>
          <Link href="/" className="block text-center text-slate-400 hover:text-white mt-4 text-sm">
            ← Back to Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">⚙️ Admin Panel</h1>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
            >
              ← Back to Game
            </Link>
            <button
              onClick={clearAll}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white font-medium transition"
            >
              🗑️ Clear All Scores
            </button>
            <button
              onClick={loadScores}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-left">Address</th>
                  <th className="px-4 py-3 text-right">Profit</th>
                  <th className="px-4 py-3 text-right">Trades</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Holdings</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : scores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No scores yet
                    </td>
                  </tr>
                ) : (
                  scores.map((score) => (
                    <tr key={score.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3">{score.playerName}</td>
                      <td className="px-4 py-3 font-mono text-xs">{score.playerAddress?.slice(0, 8)}...</td>
                      <td className={`px-4 py-3 text-right font-bold ${score.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {score.profit >= 0 ? '+' : ''}${score.profit?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">{score.trades}</td>
                      <td className="px-4 py-3 text-right">${score.finalBalance?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{score.finalHoldings?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{score.timestamp}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteScore(score.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-slate-400 text-sm">
          Total scores: {scores.length}
        </div>
      </div>
    </div>
  );
}
