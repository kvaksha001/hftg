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
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
      setUnlockedAchievements(unlocked);
      
      const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
      const savedStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
      const savedNickname = localStorage.getItem('playerNickname') || '';
      const savedAvatar = localStorage.getItem('playerAvatar') || '';
      
      setNickname(savedNickname);
      setAvatar(savedAvatar);
      
      setStats({
        totalTrades: gameState.history?.length || 0,
        balance: gameState.balance || 1000,
        holdings: gameState.holdings || 0,
        ...savedStats
      });
    }
  }, []);

  const handleSaveNickname = () => {
    if (tempNickname.trim().length < 3) {
      alert('Nickname must be at least 3 characters!');
      return;
    }
    if (tempNickname.trim().length > 20) {
      alert('Nickname must be less than 20 characters!');
      return;
    }
    
    localStorage.setItem('playerNickname', tempNickname.trim());
    setNickname(tempNickname.trim());
    setEditingNickname(false);
    alert('✅ Nickname saved!');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Image must be less than 1MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      localStorage.setItem('playerAvatar', result);
      setAvatar(result);
      alert('✅ Avatar uploaded!');
    };
    reader.readAsDataURL(file);
  };

  if (!mounted) return null;

  const progress = (unlockedAchievements.length / ACHIEVEMENTS.length) * 100;
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${publicKey?.toBase58() || 'default'}`;

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
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-600 group-hover:border-purple-500 transition">
                <img 
                  src={avatar || defaultAvatar} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <span className="text-white text-sm font-bold">Change</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name & Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {editingNickname ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      placeholder="Enter nickname"
                      className="px-3 py-2 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                      maxLength={20}
                    />
                    <button
                      onClick={handleSaveNickname}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNickname(false)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-white">
                      {nickname || 'Anonymous Trader'}
                    </h1>
                    <button
                      onClick={() => {
                        setTempNickname(nickname);
                        setEditingNickname(true);
                      }}
                      className="text-purple-400 hover:text-purple-300 transition"
                    >
                      ✏️ Edit
                    </button>
                  </>
                )}
              </div>
              {publicKey ? (
                <p className="text-slate-400 font-mono text-sm">{publicKey.toBase58().slice(0, 20)}...</p>
              ) : (
                <p className="text-slate-400">Connect wallet to save progress</p>
              )}
            </div>
          </div>
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
