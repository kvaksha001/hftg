'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(1000);
  const [price, setPrice] = useState(100);
  const [holdings, setHoldings] = useState(0);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [history, setHistory] = useState<Array<{type: string, amount: number, price: number}>>([]);

  // Real-time price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(50, prev + change);
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">🎮 HFTG</h1>
            <p className="text-slate-400 text-sm mt-1">High-Frequency Trading Game on Solana</p>
          </div>
          <WalletMultiButton />
        </div>

        {publicKey ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Card */}
              <div className="bg-slate-700 rounded-lg p-6 text-white border border-slate-600">
                <h2 className="text-xl font-bold mb-4">📊 Current Price</h2>
                <div className="text-5xl font-bold text-green-400 mb-2">
                  ${price.toFixed(2)}
                </div>
                <p className="text-slate-300 text-sm">Updates in real-time every second</p>
              </div>

              {/* Trading Cards */}
              <div className="grid grid-cols-2 gap-6">
                {/* Buy Card */}
                <div className="bg-slate-700 rounded-lg p-6 text-white border border-slate-600">
                  <h3 className="text-xl font-bold mb-4">💰 Buy</h3>
                  <input
                    type="number"
                    placeholder="Number of tokens"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 rounded mb-3 text-white placeholder-slate-400 border border-slate-500"
                  />
                  <div className="text-sm text-slate-300 mb-3">
                    Cost: ${((parseFloat(buyAmount) || 0) * price).toFixed(2)}
                  </div>
                  <button
                    onClick={handleBuy}
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold transition"
                  >
                    Buy Tokens
                  </button>
                </div>

                {/* Sell Card */}
                <div className="bg-slate-700 rounded-lg p-6 text-white border border-slate-600">
                  <h3 className="text-xl font-bold mb-4">📈 Sell</h3>
                  <input
                    type="number"
                    placeholder="Number of tokens"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-600 rounded mb-3 text-white placeholder-slate-400 border border-slate-500"
                  />
                  <div className="text-sm text-slate-300 mb-3">
                    Revenue: ${((parseFloat(sellAmount) || 0) * price).toFixed(2)}
                  </div>
                  <button
                    onClick={handleSell}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition"
                  >
                    Sell Tokens
                  </button>
                </div>
              </div>

              {/* Trade History */}
              <div className="bg-slate-700 rounded-lg p-6 text-white border border-slate-600">
                <h3 className="text-xl font-bold mb-4">📜 Trade History</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-slate-400 text-sm">No trades yet. Start trading to see history.</p>
                  ) : (
                    history.map((trade, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 bg-slate-600 rounded border border-slate-500">
                        <span className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                          {trade.type} {trade.amount.toFixed(2)} @ ${trade.price.toFixed(2)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Portfolio */}
            <div className="space-y-6">
              {/* Portfolio Card */}
              <div className="bg-slate-700 rounded-lg p-6 text-white sticky top-8 border border-slate-600">
                <h3 className="text-xl font-bold mb-4">💼 Portfolio</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Cash</p>
                    <p className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-slate-500 pt-3">
                    <p className="text-slate-400 text-sm">Tokens</p>
                    <p className="text-2xl font-bold text-blue-400">{holdings.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-slate-500 pt-3">
                    <p className="text-slate-400 text-sm">Total Value</p>
                    <p className="text-2xl font-bold text-yellow-400">${totalValue.toFixed(2)}</p>
                  </div>
                  <div className="border-t border-slate-500 pt-3">
                    <p className="text-slate-400 text-sm">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${profitLoss.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-slate-700 rounded-lg p-4 text-white text-sm border border-slate-600">
                <p className="text-slate-300">
                  <span className="font-bold">Start with:</span> $1,000<br/>
                  <span className="font-bold">Current price:</span> ${price.toFixed(2)}<br/>
                  <span className="font-bold">Goal:</span> Make profit!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-700 rounded-lg p-8 text-center text-white border border-slate-600">
            <h2 className="text-3xl font-bold mb-4">Welcome to HFTG! 🚀</h2>
            <p className="text-slate-300 mb-2">High-Frequency Trading Game on Solana</p>
            <p className="text-slate-400 mb-6">Connect your Solflare or Phantom wallet to start trading</p>
            <WalletMultiButton />
          </div>
        )}
      </div>
    </main>
  );
}
