'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(100);
  const [holdings, setHoldings] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [history, setHistory] = useState<Array<{type: string, amount: number, price: number}>>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{time: number, price: number}>>([]);

  // Real-time price simulation with history tracking
  useEffect(() => {
    let timeCounter = 0;
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 10;
        const newPrice = Math.max(50, prev + change);
        
        // Track price history (keep last 60 points)
        setPriceHistory(h => {
          const updated = [...h, { time: timeCounter, price: newPrice }];
          return updated.slice(-60);
        });
        
        timeCounter++;
        return newPrice;
      });
    }, 1000);
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

  const totalValue = balance + (holdings * price);
  const profitLoss = totalValue - 1000;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-white">🎮 HFTG</h1>
            <p className="text-slate-400 text-sm mt-1">High-Frequency Trading Game • Powered by Solana</p>
          </div>
          <WalletMultiButton />
        </div>

        {publicKey ? (
          <div className="space-y-6">
            {/* Price Chart */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white border border-slate-600 shadow-lg">
              <h2 className="text-xl font-bold mb-4">📈 Price Chart (Last 60 seconds)</h2>
              {priceHistory.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['dataMin - 10', 'dataMax + 10']} />
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
              {/* Main Trading Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Price */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white border border-slate-600 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">💰 Current Price</h2>
                  <div className="text-6xl font-bold text-green-400 mb-2">
                    ${price.toFixed(2)}
                  </div>
                  <p className="text-slate-300 text-sm">Updates every second</p>
                </div>

                {/* Trading Cards */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Buy Card */}
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white border border-green-500/30 shadow-lg hover:border-green-500/60 transition">
                    <h3 className="text-xl font-bold mb-4">🟢 Buy Tokens</h3>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 rounded mb-3 text-white placeholder-slate-400 border border-slate-500 focus:border-green-500 focus:outline-none"
                    />
                    <div className="text-sm text-slate-300 mb-3">
                      Cost: <span className="text-green-400 font-bold">${((parseFloat(buyAmount) || 0) * price).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleBuy}
                      className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded font-bold transition transform hover:scale-105 active:scale-95"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Sell Card */}
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white border border-red-500/30 shadow-lg hover:border-red-500/60 transition">
                    <h3 className="text-xl font-bold mb-4">🔴 Sell Tokens</h3>
                    <input
                      type="number"
                      placeholder="Amount"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 rounded mb-3 text-white placeholder-slate-400 border border-slate-500 focus:border-red-500 focus:outline-none"
                    />
                    <div className="text-sm text-slate-300 mb-3">
                      Revenue: <span className="text-red-400 font-bold">${((parseFloat(sellAmount) || 0) * price).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleSell}
                      className="w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded font-bold transition transform hover:scale-105 active:scale-95"
                    >
                      Sell Now
                    </button>
                  </div>
                </div>

                {/* Trade History */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white border border-slate-600 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">📜 Trade History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-slate-400 text-sm">No trades yet. Start trading!</p>
                    ) : (
                      [...history].reverse().map((trade, i) => (
                        <div key={i} className={`flex justify-between text-sm p-3 rounded border ${trade.type === 'BUY' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
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

              {/* Portfolio Sidebar */}
              <div className="space-y-6">
                {/* Portfolio Card */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 text-white sticky top-8 border border-slate-600 shadow-lg">
                  <h3 className="text-2xl font-bold mb-4">💼 Portfolio</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-600/50 p-4 rounded">
                      <p className="text-slate-400 text-sm">Cash Balance</p>
                      <p className="text-3xl font-bold text-green-400">${balance.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-600/50 p-4 rounded">
                      <p className="text-slate-400 text-sm">Holdings</p>
                      <p className="text-3xl font-bold text-blue-400">{holdings.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-600/50 p-4 rounded">
                      <p className="text-slate-400 text-sm">Total Value</p>
                      <p className="text-3xl font-bold text-yellow-400">${totalValue.toFixed(2)}</p>
                    </div>
                    <div className={`${profitLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} p-4 rounded border ${profitLoss >= 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
                      <p className="text-slate-400 text-sm">Profit/Loss</p>
                      <p className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-4 text-white border border-slate-600 shadow-lg text-sm">
                  <p className="mb-2"><span className="font-bold text-blue-400">Network:</span> Solana Devnet</p>
                  <p className="mb-2"><span className="font-bold text-blue-400">Start:</span> $1,000</p>
                  <p><span className="font-bold text-blue-400">Goal:</span> Maximize Profit! 🚀</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-12 text-center text-white border border-slate-600 shadow-lg">
            <h2 className="text-4xl font-bold mb-4">Welcome to HFTG 🚀</h2>
            <p className="text-slate-300 mb-2 text-lg">High-Frequency Trading Game on Solana</p>
            <p className="text-slate-400 mb-8">Experience real-time trading with instant price updates</p>
            <WalletMultiButton />
          </div>
        )}
      </div>
    </main>
  );
}
