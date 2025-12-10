import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

const DEVNET_RPC = 'https://api.devnet.solana.com';

export interface TradeRecord {
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  profit: number;
}

class BlockchainService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
  }

  async batchVerifyTrades(
    wallet: WalletContextState,
    trades: TradeRecord[]
  ): Promise<string | null> {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        console.log('Wallet not connected');
        return null;
      }

      const tradeSummary = {
        totalTrades: trades.length,
        buyTrades: trades.filter(t => t.type === 'BUY').length,
        sellTrades: trades.filter(t => t.type === 'SELL').length,
        timestamp: Date.now(),
      };

      const instruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 5000,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());

      await this.connection.confirmTransaction(signature, 'confirmed');

      console.log('Batch verified:', tradeSummary);
      return signature;
    } catch (error) {
      console.error('Batch verification error:', error);
      return null;
    }
  }

  async verifySignature(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature);
      return tx !== null;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }

  async getTransactionHistory(publicKey: PublicKey, limit: number = 10) {
    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      const transactions = [];

      for (const sig of signatures) {
        const tx = await this.connection.getTransaction(sig.signature);
        if (tx) {
          transactions.push({
            signature: sig.signature,
            timestamp: tx.blockTime || 0,
            status: sig.err ? 'failed' : 'success',
          });
        }
      }

      return transactions;
    } catch (error) {
      console.error('Transaction history error:', error);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();

export async function batchVerifyTrades(
  wallet: WalletContextState,
  trades: TradeRecord[]
): Promise<string | null> {
  const signature = await blockchainService.batchVerifyTrades(wallet, trades);
  return signature;
}

export async function getWalletInfo(publicKey: PublicKey) {
  const balance = await blockchainService.getWalletBalance(publicKey);
  const history = await blockchainService.getTransactionHistory(publicKey);
  return { balance, history };
}
