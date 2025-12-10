'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS, checkAchievements } from '@/lib/achievements';
import { playSound } from '@/lib/sounds';
import { batchVerifyTrades, getWalletInfo } from '@/lib/blockchain';
import Link from 'next/link';

export default function Home() {
  const { publicKey } = useWallet();
  const wallet = useWallet();
  
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(100);
  const [holdings, setHoldings] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [history, setHistory] = useState<Array<{type: string, amount: number, price: number, timestamp: number, profit: number}>>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{time: number, price: number}>>([]);
  const [profitHistory, setProfitHistory] = useState<Array<{time: number, profit: number}>>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{rank: number, name: string, profit: number, trades: number, avatar?: string}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null);
  const [lastProfit, setLastProfit] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [biggestTrade, setBiggestTrade] = useState(0);
  const [maxHoldings, setMaxHoldings] = useState(0);

  const [gameMode, setGameMode] = useState<'normal' | 'speed' | 'hardcore' | 'random'>('normal');
  const [timeLeft, setTimeLeft] = useState(300);
  const [lives, setLives] = useState(3);
  const [randomEvent, setRandomEvent] = useState<{name: string, emoji: string} | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<{target: number, reward: number, completed: boolean} | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [blockchainTrades, setBlockchainTrades] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) return;

    const fetchWalletInfo = async () => {
      try {
        const info = await getWalletInfo(publicKey);
        setWalletBalance(info.balance);
        setBlockchainTrades(info.history);
      } catch (error) {
        console.error('Fetch wallet info error:', error);
      }
    };

    fetchWalletInfo();
    const interval = setInterval(fetchWalletInfo, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gameState');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          setBalance(state.balance || 1000);
          setHoldings(state.holdings || 0);
          setHistory(state.history || []);
        } catch (e) {
          console.log('No saved state');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const state = { balance, holdings, history };
      localStorage.setItem('gameState', JSON.stringify(state));
    }
  }, [balance, holdings, history]);

  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 10;
        const newPrice = Math.max(50, prev + change);
        
        setPriceHistory(h => {
          const updated = [...h, { time: counter, price: newPrice }];
          return updated.slice(-60);
        });
        
        counter++;
        return newPrice;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (gameMode !== 'speed') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const profitLoss = (balance + holdings * price) - 1000;
          
          let bonus = 0;
          if (profitLoss > 0) {
            bonus = Math.floor(profitLoss * 0.5);
            setBalance(b => b + bonus);
          }
          
          playSound('achievement');
          confetti({ particleCount: 200, spread: 90 });
          alert(`🏁 Time's Up!\n\n💰 Your Profit: $${profitLoss.toFixed(2)}\n🎁 Speed Bonus: $${bonus}\n✨ Total: $${(profitLoss + bonus).toFixed(2)}`);
          
          setGameMode('normal');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameMode, balance, holdings, price]);

  useEffect(() => {
    if (gameMode !== 'random') return;

    const interval = setInterval(() => {
      if (Math.random() < 0.2) {
        const events = [
          { 
            name: 'BULL RUN', 
            emoji: '📈',
            effect: () => {
              setPrice(p => {
                const newPrice = p + 50;
                return newPrice;
              });
            }
          },
          { 
            name: 'MARKET CRASH', 
            emoji: '📉',
            effect: () => {
              setPrice(p => {
                const newPrice = Math.max(50, p - 40);
                return newPrice;
              });
            }
          },
          { 
            name: 'VOLATILITY SPIKE', 
            emoji: '⚡',
            effect: () => {
              setPrice(p => {
                const change = (Math.random() - 0.5) * 60;
                const newPrice = Math.max(50, p + change);
                return newPrice;
              });
            }
          },
          { 
            name: 'WHALE DUMP', 
            emoji: '🐋',
            effect: () => {
              setPrice(p => {
                const newPrice = Math.max(50, p - 25);
                return newPrice;
              });
            }
          },
          { 
            name: 'PUMP IT UP', 
            emoji: '🚀',
            effect: () => {
              setPrice(p => {
                const newPrice = p + 35;
                return newPrice;
              });
            }
          },
          { 
            name: 'RUG PULL', 
            emoji: '💀',
            effect: () => {
              setPrice(p => {
                const newPrice = Math.max(50, p * 0.7);
                return newPrice;
              });
            }
          }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        
        setRandomEvent({ name: event.name, emoji: event.emoji });
        event.effect();
        
        playSound('achievement');
        confetti({ particleCount: 100, spread: 80 });
        
        setTimeout(() => setRandomEvent(null), 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [gameMode]);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('dailyChallenge');
    const savedDate = localStorage.getItem('challengeDate');
    
    if (savedDate === today && savedChallenge) {
      setDailyChallenge(JSON.parse(savedChallenge));
    } else {
      const targets = [
        { target: 200, reward: 50 },
        { target: 500, reward: 100 },
        { target: 1000, reward: 250 },
      ];
      const challenge = targets[Math.floor(Math.random() * targets.length)];
      
      setDailyChallenge({ ...challenge, completed: false });
      localStorage.setItem('dailyChallenge', JSON.stringify({ ...challenge, completed: false }));
      localStorage.setItem('challengeDate', today);
    }
  }, []);

  useEffect(() => {
    if (!dailyChallenge || dailyChallenge.completed) return;
    
    const profitLoss = (balance + holdings * price) - 1000;
    
    if (profitLoss >= dailyChallenge.target) {
      const updated = { ...dailyChallenge, completed: true };
      setDailyChallenge(updated);
      localStorage.setItem('dailyChallenge', JSON.stringify(updated));
      
      alert(`🎉 Daily Challenge Complete! +$${dailyChallenge.reward} bonus!`);
      setBalance(prev => prev + dailyChallenge.reward);
      
      playSound('achievement');
      confetti({ particleCount: 200, spread: 90 });
    }
  }, [balance, holdings, price, dailyChallenge]);

  useEffect(() => {
    const totalValue = balance + (holdings * price);
    const profitLoss = totalValue - 1000;
    
    setProfitHistory(h => {
      const updated = [...h, { time: h.length, profit: profitLoss }];
      return updated.slice(-60);
    });

    if (profitLoss > lastProfit && lastProfit !== 0 && profitLoss > 0) {
      playSound('profit');
    } else if (profitLoss < lastProfit && lastProfit !== 0 && profitLoss < -50) {
      playSound('loss');
    }
    setLastProfit(profitLoss);
  }, [balance, holdings, price, lastProfit]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'scores'),
          orderBy('profit', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const scores = snapshot.docs.map((doc, index) => ({
          rank: index + 1,
          name: doc.data().playerName,
          profit: doc.data().profit,
          trades: doc.data().trades,
          avatar: doc.data().playerAvatar || ''
        }));
        setLeaderboard(scores);
      } catch (error) {
        console.log('Leaderboard loading...');
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkAndShowAchievements = () => {
    const currentProfit = (balance + holdings * price) - 1000;
    
    const stats = {
      totalTrades: history.length,
      profit: currentProfit,
      winStreak,
      biggestTrade,
      maxHoldings,
      biggestLoss: currentProfit < -200 ? currentProfit : 0
    };
    
    localStorage.setItem('playerStats', JSON.stringify(stats));
    
    const newAchievements = checkAchievements(stats);
    
    if (newAchievements.length > 0) {
      playSound('achievement');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const achievement = ACHIEVEMENTS.find(a => a.id === newAchievements[0]);
      if (achievement) {
        setAchievementNotification(`${achievement.icon} ${achievement.title}`);
        setTimeout(() => setAchievementNotification(null), 5000);
      }
    }
  };

  const handleBuy = async () => {
    const amount = parseFloat(buyAmount);
    if (!amount || amount <= 0) return;
    
    const cost = amount * price;
    if (cost > balance) {
      alert('Insufficient funds!');
      playSound('loss');
      return;
    }

    playSound('buy');
    setBalance(prev => prev - cost);
    setHoldings(prev => {
      const newHoldings = prev + amount;
      if (newHoldings > maxHoldings) setMaxHoldings(newHoldings);
      return newHoldings;
    });
    setHistory(prev => [...prev, { type: 'BUY', amount, price, timestamp: Date.now(), profit: 0 }]);
    setBuyAmount('');
    
    if (cost > biggestTrade) setBiggestTrade(cost);
    
    setTimeout(() => checkAndShowAchievements(), 100);
  };

  const handleSell = async () => {
    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) return;
    if (amount > holdings) {
      alert('Insufficient tokens!');
      playSound('loss');
      return;
    }

    const revenue = amount * price;
    
    const lastBuyPrice = [...history].reverse().find(h => h.type === 'BUY')?.price || 100;
    const tradeProfit = (price - lastBuyPrice) * amount;
    
    if (gameMode === 'hardcore' && tradeProfit < 0) {
      setLives(prev => {
        const newLives = prev - 1;
        
        if (newLives <= 0) {
          playSound('loss');
          alert('💀 GAME OVER! You lost all lives!');
          
          setGameMode('normal');
          setBalance(1000);
          setHoldings(0);
          setHistory([]);
          setLives(3);
          setPriceHistory([]);
          setProfitHistory([]);
          setWinStreak(0);
          setBiggestTrade(0);
          setMaxHoldings(0);
          
          localStorage.removeItem('gameState');
          
          return 3;
        }
        
        return newLives;
      });
      
      return;
    }
    
    playSound('sell');
    
    if (tradeProfit > 0) {
      setWinStreak(prev => prev + 1);
    } else {
      setWinStreak(0);
    }
    
    setBalance(prev => prev + revenue);
    setHoldings(prev => prev - amount);
    setHistory(prev => [...prev, { type: 'SELL', amount, price, timestamp: Date.now(), profit: tradeProfit }]);
    setSellAmount('');
    
    if (revenue > biggestTrade) setBiggestTrade(revenue);
    
    setTimeout(() => checkAndShowAchievements(), 100);
  };

  const handleSaveScore = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    const totalValue = balance + (holdings * price);
    const profitLoss = totalValue - 1000;

    const savedKey = `lastProfit_${publicKey.toBase58()}`;
    const lastProfit = localStorage.getItem(savedKey);
    
    if (lastProfit && parseFloat(lastProfit) === profitLoss) {
      alert('You already saved this exact profit! Trade more to submit a new score.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let blockchainSignature = null;
      
      if (history.length > 0) {
        setIsVerifying(true);
        blockchainSignature = await batchVerifyTrades(wallet, history as any);
        setIsVerifying(false);
        
        if (!blockchainSignature) {
          const continueAnyway = confirm('Blockchain verification failed. Save score anyway?');
          if (!continueAnyway) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      const nickname = localStorage.getItem('playerNickname') || '';
      const avatar = localStorage.getItem('playerAvatar') || '';
      const displayName = nickname || publicKey.toBase58().slice(0, 8) + '...';

      await addDoc(collection(db, 'scores'), {
        playerName: displayName,
        playerNickname: nickname,
        playerAvatar: avatar,
        playerAddress: publicKey.toBase58(),
        profit: profitLoss,
        trades: history.length,
        finalBalance: balance,
        finalHoldings: holdings,
        timestamp: new Date(),
        finalPrice: price,
        gameMode: gameMode,
        blockchainVerified: !!blockchainSignature,
        blockchainSignature: blockchainSignature,
        walletBalance: walletBalance
      });

      localStorage.setItem(savedKey, profitLoss.toString());
      
      if (blockchainSignature) {
        alert('✅ Score saved and verified on blockchain!');
      } else {
        alert('✅ Score saved to leaderboard!');
      }
      
      playSound('achievement');
      confetti({ particleCount: 200, spread: 90 });
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Error saving score: ' + (error as any).message);
    } finally {
      setIsSubmitting(false);
      setIsVerifying(false);
    }
  };

  const totalValue = balance + (holdings * price);
  const profitLoss = totalValue - 1000;

  const buyTrades = history.filter(t => t.type === 'BUY');
  const sellTrades = history.filter(t => t.type === 'SELL');
  const totalTrades = history.length;
  
  let bestTrade = 0;
  let profitableTrades = 0;

  for (let i = 0; i < sellTrades.length; i++) {
    const sellPrice = sellTrades[i].price;
    let buyPrice = 100;
    for (let j = history.length - 1; j >= 0; j--) {
      if (history[j].type === 'BUY' && history[j].price < sellPrice) {
        buyPrice = history[j].price;
        break;
      }
    }
    
    const tradeProfit = (sellPrice - buyPrice) * sellTrades[i].amount;
    if (tradeProfit > 0) profitableTrades++;
    if (tradeProfit > bestTrade) bestTrade = tradeProfit;
  }

  const winRate = totalTrades > 0 ? Math.round((profitableTrades / Math.max(1, sellTrades.length)) * 100) : 0;

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              🎮 HFTG
            </h1>
            <p className="text-slate-400 text-sm mt-1">High-Frequency Trading Game • Powered by Solana • ⚡ Real-Time • 🔗 Batch Verified</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link
              href="/profile"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition"
            >
              👤 Profile
            </Link>
            <WalletMultiButton />
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition"
            >
              🔄 Reset Game
            </button>
          </div>
        </div>

        {publicKey && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-lg">🔗 Blockchain Connected</p>
                <p className="text-blue-100 text-sm">
                  Wallet: {publicKey.toBase58().slice(0, 8)}... • Balance: ◎ {walletBalance.toFixed(4)} SOL
                </p>
              </div>
              <div className="text-white">
                <p className="font-bold">✓ {history.length} Trades Ready</p>
                <p className="text-blue-100 text-sm">Verify all when saving score</p>
              </div>
            </div>
          </div>
        )}

        {dailyChallenge && !dailyChallenge.completed && (
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-4 mb-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-lg">🎯 Daily Challenge</p>
                <p className="text-yellow-100 text-sm">
                  Reach ${dailyChallenge.target} profit to win ${dailyChallenge.reward}!
                </p>
              </div>
              <div className="text-3xl font-bold text-white">
                ${profitLoss.toFixed(0)} / ${dailyChallenge.target}
              </div>
            </div>
            <div className="mt-2 bg-yellow-900/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-yellow-300 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (profitLoss / dailyChallenge.target) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-4">🎮 Game Modes</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setGameMode('normal')}
              className={`px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                gameMode === 'normal' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🎯 Normal
            </button>

            <button
              onClick={() => {
                setGameMode('speed');
                setTimeLeft(300);
              }}
              className={`px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                gameMode === 'speed' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ⚡ Speed<br/><span className="text-xs">5 min</span>
            </button>

            <button
              onClick={() => {
                setGameMode('hardcore');
                setLives(3);
              }}
              className={`px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                gameMode === 'hardcore' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              💀 Hardcore<br/><span className="text-xs">3 lives</span>
            </button>

            <button
              onClick={() => setGameMode('random')}
              className={`px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                gameMode === 'random' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🎲 Chaos<br/><span className="text-xs">events</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
            {gameMode === 'normal' && (
              <p className="text-slate-300 text-sm">
                <span className="font-bold text-blue-400">🎯 Normal Mode:</span> Classic trading with no time limit. Trade at your own pace!
              </p>
            )}
            {gameMode === 'speed' && (
              <p className="text-slate-300 text-sm">
                <span className="font-bold text-orange-400">⚡ Speed Mode:</span> 5 minutes to maximize profit! <span className="text-green-400 font-bold">+50% bonus</span> on final profit!
              </p>
            )}
            {gameMode === 'hardcore' && (
              <p className="text-slate-300 text-sm">
                <span className="font-bold text-red-400">💀 Hardcore Mode:</span> Only 3 lives! Lose money = lose a life. Game over at 0 lives!
              </p>
            )}
            {gameMode === 'random' && (
              <p className="text-slate-300 text-sm">
                <span className="font-bold text-purple-400">🎲 Chaos Mode:</span> Random market events every 5 seconds! 📈 Bull runs (+$50), 📉 crashes (-$40), 🚀 pumps (+$35), 💀 rug pulls (-30%), and more!
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">📈 Price Chart (Last 60 seconds)</h2>
            {priceHistory.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis 
                    stroke="#94a3b8" 
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10b981" 
                    dot={false}
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 pb-20">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-green-500/30 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">💰 Current Price</h2>
                <div className="text-6xl font-bold text-green-400 mb-2">
                  ${price.toFixed(2)}
                </div>
                <p className="text-slate-300 text-sm">Updates every second • Live Market</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-green-500/30 shadow-2xl hover:border-green-500/60 transition">
                  <h3 className="text-xl font-bold mb-4">🟢 Buy Tokens</h3>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-lg mb-3 text-white placeholder-slate-400 border border-slate-600 focus:border-green-500 focus:outline-none transition"
                  />
                  
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 5, 10, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setBuyAmount(amount.toString())}
                        className="flex-1 px-2 py-1 bg-slate-600 hover:bg-green-600 rounded text-xs font-medium transition"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-slate-300 mb-3">
                    Cost: <span className="text-green-400 font-bold">${((parseFloat(buyAmount) || 0) * price).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleBuy}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-red-500/30 shadow-2xl hover:border-red-500/60 transition">
                  <h3 className="text-xl font-bold mb-4">🔴 Sell Tokens</h3>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 rounded-lg mb-3 text-white placeholder-slate-400 border border-slate-600 focus:border-red-500 focus:outline-none transition"
                  />
                  
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 5, 10, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setSellAmount(amount.toString())}
                        className="flex-1 px-2 py-1 bg-slate-600 hover:bg-red-600 rounded text-xs font-medium transition"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-slate-300 mb-3">
                    Revenue: <span className="text-red-400 font-bold">${((parseFloat(sellAmount) || 0) * price).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleSell}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Sell Now
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-slate-700 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">📊 Profit/Loss Chart</h2>
                {profitHistory.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={profitHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis 
                        stroke="#94a3b8"
                        tickFormatter={(value) => Math.round(value).toString()}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke={profitLoss >= 0 ? '#10b981' : '#ef4444'}
                        dot={false}
                        strokeWidth={3}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-slate-700 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">📜 Trade History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-400 text-sm">No trades yet. Start trading!</p>
                  ) : (
                    [...history].reverse().map((trade, i) => (
                      <div key={i} className={`flex justify-between text-sm p-3 rounded-lg border ${trade.type === 'BUY' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <span className={trade.type === 'BUY' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                          {trade.type} {trade.amount.toFixed(2)} @ ${trade.price.toFixed(2)}
                        </span>
                        <span className="text-slate-400">
                          {trade.type === 'BUY' ? '-' : '+'}${(trade.amount * trade.price).toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-slate-700 shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">💼 Portfolio</h3>
                <div className="space-y-4">
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-sm">Cash Balance</p>
                    <p className="text-3xl font-bold text-green-400">${balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-sm">Holdings</p>
                    <p className="text-3xl font-bold text-blue-400">{holdings.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-sm">Total Value</p>
                    <p className="text-3xl font-bold text-yellow-400">${totalValue.toFixed(2)}</p>
                  </div>
                  <div className={`${profitLoss >= 0 ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'} p-4 rounded-lg border`}>
                    <p className="text-slate-400 text-sm">Profit/Loss</p>
                    <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveScore}
                  disabled={isSubmitting || isVerifying || !publicKey}
                  className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 active:scale-95 shadow-lg text-white"
                >
                  {!publicKey ? '🔗 Connect Wallet to Save' : isVerifying ? '🔗 Verifying on Blockchain...' : isSubmitting ? '💾 Saving...' : '🏆 Save & Verify on Chain'}
                </button>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white border border-slate-700 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">📊 Trading Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Total Trades</span>
                    <span className="font-bold text-blue-400">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Buy Orders</span>
                    <span className="font-bold text-green-400">{buyTrades.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Sell Orders</span>
                    <span className="font-bold text-red-400">{sellTrades.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Win Rate</span>
                    <span className={`font-bold ${winRate >= 50 ? 'text-green-400' : 'text-orange-400'}`}>{winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Best Trade</span>
                    <span className="font-bold text-green-400">${bestTrade.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white border border-slate-700 text-sm shadow-2xl">
                <p className="mb-2"><span className="font-bold text-blue-400">⚡ Network:</span> Solana Devnet</p>
                <p className="mb-2"><span className="font-bold text-blue-400">💵 Start:</span> $1,000</p>
                <p className="mb-2"><span className="font-bold text-blue-400">🎯 Goal:</span> Maximize Profit!</p>
                <p><span className="font-bold text-blue-400">🔗 Blockchain:</span> Batch Verified</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 text-white border border-slate-700 shadow-2xl">
            <h2 className="text-3xl font-bold mb-6">🏆 Global Leaderboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaderboard.length === 0 ? (
                <p className="col-span-full text-slate-400 text-center py-8">Be the first to join the leaderboard! Save your score.</p>
              ) : (
                leaderboard.map((trader) => (
                  <div 
                    key={trader.rank}
                    className={`p-4 rounded-lg border ${
                      trader.rank === 1 
                        ? 'bg-yellow-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30' 
                        : trader.rank === 2 
                        ? 'bg-gray-400/20 border-gray-400/50' 
                        : trader.rank === 3 
                        ? 'bg-orange-500/20 border-orange-500/50'
                        : 'bg-slate-700/50 border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {trader.avatar ? (
                        <img 
                          src={trader.avatar} 
                          alt={trader.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {trader.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className={`text-xl font-bold ${
                            trader.rank === 1 ? 'text-yellow-400' : 
                            trader.rank === 2 ? 'text-gray-300' : 
                            trader.rank === 3 ? 'text-orange-400' : 
                            'text-slate-300'
                          }`}>
                            #{trader.rank}
                          </span>
                          <span className="text-xs px-2 py-1 bg-slate-700 rounded">
                            {trader.trades} trades
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-200 font-semibold mb-2 truncate">{trader.name}</p>
                    <p className={`text-xl font-bold ${trader.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trader.profit >= 0 ? '+' : ''}${trader.profit.toFixed(2)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {gameMode === 'speed' && (
        <div className="fixed top-4 right-4 bg-orange-600 px-6 py-3 rounded-xl text-2xl font-bold shadow-2xl z-50 animate-pulse">
          ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}

      {gameMode === 'hardcore' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 px-6 py-3 rounded-xl text-2xl font-bold shadow-2xl z-50">
          {'❤️'.repeat(lives)} {lives} Lives
        </div>
      )}

      {randomEvent && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-16 py-12 rounded-3xl text-6xl font-bold animate-bounce shadow-2xl">
            <div className="text-center">
              <div className="text-8xl mb-4">{randomEvent.emoji}</div>
              <div className="text-white">{randomEvent.name}!</div>
            </div>
          </div>
        </div>
      )}

      {achievementNotification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 p-1 rounded-2xl shadow-2xl">
            <div className="bg-slate-900 rounded-xl px-8 py-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
                <p className="text-xl text-yellow-400 font-bold">{achievementNotification}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
