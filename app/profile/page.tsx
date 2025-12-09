'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { ACHIEVEMENTS } from '@/lib/achievements';

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
      setUnlockedAchievements(unlocked);
      
      const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
      const savedStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
      
      setStats({
        totalTrades: gameState.history?.length || 0,
        balance: gameState.balance || 1000,
        holdings: gameState.holdings || 0,
        ...savedStats
      });
    }
  }, []);

  if (!mounted) return null;

  const progress = (unlockedAchievements.length / ACHIEVEMENTS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-slate-400 hover:text-white transition">
            ← Back to Game
          </Link>
          <WalletMultiButton />
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">👤 Player Profile</h1>
          {publicKey ? (
            <p className="text-slate-300 font-mono">{publicKey.toBase58().slice(0, 20)}...</p>
          ) : (
            <p className="text-slate-400">Connect wallet to save progress</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Total Trades</p>
            <p className="text-3xl font-bold text-blue-400">{stats.totalTrades || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Current Balance</p>
            <p className="text-3xl font-bold text-green-400">${stats.balance?.toFixed(2) || '1000.00'}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">Holdings</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.holdings?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">🏆 Achievements</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">{unlockedAchievements.length}/{ACHIEVEMENTS.length}</p>
              <p className="text-sm text-slate-400">Unlocked</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              
              return (
                <div 
                  key={achievement.id}
                  className={`p-6 rounded-lg border transition ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/50 shadow-lg' 
                      : 'bg-slate-700/30 border-slate-600 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-3 filter" style={{ filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {achievement.icon}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                    {achievement.description}
                  </p>
                  {isUnlocked && (
                    <div className="mt-3 text-xs text-green-400 font-semibold">
                      ✓ UNLOCKED
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Link 
          href="/"
          className="mt-8 block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg text-center transition transform hover:scale-105"
        >
          🎮 Back to Trading
        </Link>
      </div>
    </div>
  );
}
