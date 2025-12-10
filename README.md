# 🎮 HFTG - High-Frequency Trading Game

> **Trade. Compete. Dominate.** A real-time blockchain trading simulation game on Solana.

**Live Demo:** [https://hftg.vercel.app](https://hftg.vercel.app)

---

## 🚀 What is HFTG?

**HFTG** is a competitive trading game where you trade virtual tokens in real-time with dynamic price movements. Master the markets, climb the leaderboard, and prove you're the best trader!

### ⚡ Key Features

- 🔥 **Real-Time Trading** - Prices update every second
- 🏆 **Global Leaderboard** - Compete with players worldwide
- 🎮 **4 Game Modes** - Normal, Speed, Hardcore, Chaos
- 🎯 **Daily Challenges** - Complete goals for bonus rewards
- 🏅 **Achievement System** - Unlock badges for milestones
- 🔗 **Solana Integration** - Wallet connection & on-chain verification
- 📊 **Live Charts** - Track price & profit in real-time
- 🎨 **Custom Profiles** - Set nickname and avatar
- 🔊 **Sound Effects** - Immersive audio feedback

---

## 🎮 Game Modes

### 🎯 Normal Mode
Classic trading with no time limit. Trade at your own pace. Perfect for beginners.

### ⚡ Speed Mode
5-minute challenge to maximize profit with **+50% bonus** on final profit! High risk, high reward.

### 💀 Hardcore Mode
Only 3 lives ❤️❤️❤️. Lose money = lose a life. Game over at 0 lives. For PRO traders only.

### 🎲 Chaos Mode
Random market events every 5 seconds:
- 📈 **Bull Run** - Price +$50
- 📉 **Market Crash** - Price -$40
- 🚀 **Pump It Up** - Price +$35
- 💀 **Rug Pull** - Price -30%
- 🐋 **Whale Dump** - Price -$25
- ⚡ **Volatility Spike** - Random ±$30

---

## 🏆 Features

### Trading System
- Buy/Sell tokens instantly
- Quick buttons (1, 2, 5, 10, 100)
- Real-time profit/loss tracking
- Trade history with blockchain proofs

### Profile System
- Custom nickname and avatar
- View your achievements
- Track statistics
- Player bio and badges

### Leaderboard
- Top 10 global traders
- Real-time updates every 5 seconds
- Shows profit, trades, and rank

### Daily Challenges
- New challenge every day
- Profit targets: $200, $500, $1000
- Bonus rewards: $50-$250
- Automatic progress tracking

### Achievements
- 🎯 First Trade
- 💰 Profit Master ($500)
- 🔥 High Roller ($1000)
- 📈 Trading Spree (10 wins)
- 💎 Diamond Hands (100+ tokens)
- 🎲 Risk Taker (50+ trades)
- 🏆 Millionaire ($5000)
- 💀 Hardcore Survivor
- ⚡ Speed Demon
- 🌊 Whale (single $1000+ trade)

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (React framework)
- TypeScript
- Tailwind CSS
- Recharts (charts)
- Canvas Confetti (animations)

**Blockchain:**
- Solana Web3.js
- Solana Wallet Adapter
- Phantom, Solflare support

**Backend:**
- Firebase Firestore (database)
- Vercel (hosting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet (Phantom/Solflare)

### Installation

Clone repository
git clone https://github.com/kvaksha001/hftg.git
cd hftg

Install dependencies
npm install

Create .env.local with Firebase config
See .env.example for required variables
Run development server
npm run dev

text

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

Create `.env.local`:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

text

Get Firebase config at [Firebase Console](https://console.firebase.google.com/)

---

## 📦 Project Structure

hftg/
├── app/
│ ├── page.tsx # Main game
│ ├── profile/page.tsx # Profile & achievements
│ ├── layout.tsx # Wallet provider
│ └── globals.css
├── lib/
│ ├── firebase.ts # Firebase setup
│ ├── achievements.ts # Achievement logic
│ ├── sounds.ts # Audio system
│ └── blockchain.ts # Solana integration
├── public/
│ └── sounds/ # Audio files
└── package.json

text

---

## 🎯 How to Play

1. **Connect Wallet** - Click wallet button (top right)
2. **Choose Mode** - Select game mode
3. **Trade** - Buy low, sell high!
4. **Save Score** - Submit to leaderboard
5. **Complete Challenges** - Earn bonuses
6. **Unlock Achievements** - Collect badges!

---

## 📊 Game Mechanics

**Starting:** $1,000 cash, 0 tokens  
**Price Updates:** Every second  
**Price Range:** $50 - $200+  

**Profit Formula:**
Total Value = Cash + (Tokens × Price)
Profit = Total Value - $1,000

text

---

## 🔐 Security

- Client-side game logic only
- No real money involved
- Wallet signatures for verification
- Firebase security rules enabled
- No private keys stored

---

## 🚧 Roadmap

- [ ] NFT items & boosts
- [ ] Multiplayer PvP mode
- [ ] Weekly tournaments
- [ ] AI trading assistant
- [ ] Mobile PWA
- [ ] Social features (chat, clans)
- [ ] Real SOL mode (with license)

---

## 🤝 Contributing

Pull requests welcome! Open issues for bugs/features.

---

## 📞 Contact

Built by **kvaksha001**

- GitHub: [@kvaksha001](https://github.com/kvaksha001)
- Twitter: [@kvaksha001](https://twitter.com/kvaksha001)
- Telegram: https://t.me/@zxck1d


---

**Built with ❤️ on Solana**

⭐ Star this repo if you like it!