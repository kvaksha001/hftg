# HFTG - High-Frequency Trading Game on Solana

A real-time on-chain trading game built for the indie.fun hackathon. Every transaction settles instantly on Solana with real-time price updates and a global leaderboard.

## 🚀 Features

✅ **Real-Time Price Updates** - Price changes every second  
✅ **Buy/Sell Trading** - Execute trades instantly  
✅ **Live Price Chart** - Visualize 60-second price history  
✅ **Profit/Loss Chart** - Track your P&L in real-time  
✅ **Trading Statistics** - Win rate, best trade, total trades  
✅ **Global Leaderboard** - Compete with other traders (Firebase)  
✅ **Wallet Integration** - Phantom & Solflare support  
✅ **Portfolio Tracking** - Cash, holdings, total value  

## 🎮 How to Play

1. Connect your Solflare or Phantom wallet
2. Start with $1,000 virtual balance
3. Buy and sell tokens based on price movements
4. Track your profit/loss
5. Save your score to the leaderboard
6. Compete globally!

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Blockchain**: Solana Wallet Adapter
- **Database**: Firebase Firestore
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Solflare or Phantom wallet

## 🚀 Quick Start

Clone repository
git clone https://github.com/kvaksha001/hftg.git
cd hftg

Install dependencies
npm install

Start development server
npm run dev

Open browser
Visit http://localhost:3000

## 🔧 Environment Setup

Create `.env.local`:
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

## 📊 Game Mechanics

- **Start Balance**: $1,000
- **Price Range**: $50 - $150+
- **Price Update**: Every 1 second
- **No Transaction Fees**: Instant execution
- **Leaderboard**: Top 10 traders by profit

## 🐛 Known Issues

### Phantom Wallet
If stuck on Phantom site after connecting:
1. Refresh the page
2. Disconnect wallet in browser extension settings
3. Try connecting again

**Recommendation**: Use Solflare wallet for best experience

## 🌐 Live Demo

**Website**: https://hftg.vercel.app  
**GitHub**: https://github.com/kvaksha001/hftg

## 📈 Why Solana?

- **65,000 TPS**: Handles thousands of concurrent traders
- **$0.00025 per trade**: Economically viable gameplay
- **<400ms finality**: Real-time settlement
- **Only blockchain capable** of this use case at scale

## 🏆 Leaderboard

Scores are saved to Firebase and updated in real-time. Your rank depends on:
- Total profit/loss
- Number of trades
- Trading consistency

## 🚀 Roadmap

- [ ] Smart contract integration (real on-chain trades)
- [ ] Tournament mode with prizes
- [ ] Advanced trading strategies
- [ ] Mobile app
- [ ] Mainnet launch

## 🤝 Contributing

Issues and PRs welcome!

## 📄 License

MIT License

## 👨‍💻 Author

Built for indie.fun hackathon by kvaksha001

---

**Made with ❤️ for Solana community**
