'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function Home() {
  const { publicKey } = useWallet();
  
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(100);
  const [holdings, setHoldings] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [history, setHistory] = useState<Array<{type: string, amount: number, price: number}>>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{time: number, price: number}>>([]);
  const [profitHistory, setProfitHistory] = useState<Array<{time: number, profit: number}>>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{rank: number, name: string, profit: number, trades: number}>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Load saved game state
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

// Save game state on changes
useEffect(() => {
  if (typeof window !== 'undefined') {
    const state = { balance, holdings, history };
    localStorage.setItem('gameState', JSON.stringify(state));
  }
}, [balance, holdings, history]);


  // Real-time price simulation
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

  // Update profit history when values change
  useEffect(() => {
    const totalValue = balance + (holdings * price);
    const profitLoss = totalValue - 1000;
    
    setProfitHistory(h => {
      const updated = [...h, { time: h.length, profit: profitLoss }];
      return updated.slice(-60);
    });
  }, [balance, holdings, price]);

  // Fetch leaderboard
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
          trades: doc.data().trades
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

  const handleBuy = () => {
    const amount = parseFloat(buyAmount);
    if (!amount || amount <= 0) return;
    
    const cost = amount * price;
    if (cost > balance) {
      alert('Insufficient funds!');
      return;
    }

    setBalance(prev => prev - cost);
    setHoldings(prev => prev + amount);
    setHistory(prev => [...prev, { type: 'BUY', amount, price }]);
    setBuyAmount('');
  };

  const handleSell = () => {
    const amount = parseFloat(sellAmount);
    if (!amount || amount <= 0) return;
    if (amount > holdings) {
      alert('Insufficient tokens!');
      return;
    }

    const revenue = amount * price;
    setBalance(prev => prev + revenue);
    setHoldings(prev => prev - amount);
    setHistory(prev => [...prev, { type: 'SELL', amount, price }]);
    setSellAmount('');
  };

const handleSaveScore = async () => {
  if (!publicKey) {
    alert('Please connect your wallet first!');
    return;
  }

  // Проверяем в localStorage
  const savedKey = `saved_${publicKey.toBase58()}`;
  if (localStorage.getItem(savedKey)) {
    alert('You already saved a score with this wallet!');
    return;
  }

  if (hasSaved) {
    alert('You already saved this score!');
    return;
  }

  setIsSubmitting(true);
  try {
    const totalValue = balance + (holdings * price);
    const profitLoss = totalValue - 1000;
    
    await addDoc(collection(db, 'scores'), {
      playerName: publicKey.toBase58().slice(0, 8) + '...',
      playerAddress: publicKey.toBase58(),
      profit: profitLoss,
      trades: history.length,
      finalBalance: balance,
      finalHoldings: holdings,
      timestamp: new Date(),
      finalPrice: price
    });

    // Сохраняем в localStorage
    localStorage.setItem(savedKey, 'true');
    setHasSaved(true);
    alert('✅ Score saved to leaderboard!');

    } catch (error) {
      console.error('Error saving score:', error);
      alert('Error saving score');
    } finally {
      setIsSubmitting(false);
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
            <p className="text-slate-400 text-sm mt-1">High-Frequency Trading Game • Powered by Solana • ⚡ Real-Time</p>
          </div>
          <div className="flex gap-3 items-center">
  <WalletMultiButton />
  <button
    onClick={() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }}
    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition"
  >
    {publicKey ? 'Change Wallet' : 'Reset'}
  </button>
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
                  disabled={isSubmitting || !publicKey}
                  className="w-full mt-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 rounded-lg font-bold transition transform hover:scale-105 active:scale-95 shadow-lg text-white"
                >
                  {!publicKey ? '🔗 Connect Wallet to Save' : isSubmitting ? '💾 Saving...' : '🏆 Save to Leaderboard'}
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
                <p><span className="font-bold text-blue-400">🎯 Goal:</span> Maximize Profit!</p>
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
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-2xl font-bold ${
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
    </main>
  );
}
