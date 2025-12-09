export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: '🎯 First Blood',
    description: 'Complete your first trade',
    icon: '🎯',
    condition: (stats) => stats.totalTrades >= 1
  },
  {
    id: 'profitable',
    title: '💰 In The Money',
    description: 'Make your first profit',
    icon: '💰',
    condition: (stats) => stats.profit > 0
  },
  {
    id: 'trader',
    title: '📊 Active Trader',
    description: 'Complete 10 trades',
    icon: '📊',
    condition: (stats) => stats.totalTrades >= 10
  },
  {
    id: 'day_trader',
    title: '🔥 Day Trader',
    description: 'Complete 50 trades',
    icon: '🔥',
    condition: (stats) => stats.totalTrades >= 50
  },
  {
    id: 'rich',
    title: '💎 Getting Rich',
    description: 'Earn +$500 profit',
    icon: '💎',
    condition: (stats) => stats.profit >= 500
  },
  {
    id: 'millionaire',
    title: '🏆 Millionaire Mindset',
    description: 'Earn +$1000 profit',
    icon: '🏆',
    condition: (stats) => stats.profit >= 1000
  },
  {
    id: 'win_streak',
    title: '🎲 Hot Streak',
    description: '5 profitable trades in a row',
    icon: '🎲',
    condition: (stats) => stats.winStreak >= 5
  },
  {
    id: 'high_roller',
    title: '💸 High Roller',
    description: 'Make a single trade worth $1000+',
    icon: '💸',
    condition: (stats) => stats.biggestTrade >= 1000
  },
  {
    id: 'risk_taker',
    title: '🎰 Risk Taker',
    description: 'Survive a -$200 loss',
    icon: '🎰',
    condition: (stats) => stats.biggestLoss <= -200
  },
  {
    id: 'diamond_hands',
    title: '💎🙌 Diamond Hands',
    description: 'Hold 100+ tokens',
    icon: '💎',
    condition: (stats) => stats.maxHoldings >= 100
  }
];
export const checkAchievements = (stats: any): string[] => {
  const unlocked = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  const newUnlocks: string[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
      newUnlocks.push(achievement.id);
      unlocked.push(achievement.id);
    }
  });

  if (newUnlocks.length > 0) {
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlocked));
  }

  return newUnlocks;
};
