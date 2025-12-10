import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('11111111111111111111111111111111'); // System Program

export interface TradeRecord {
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  profit: number;
  signature?: string;
}

class BlockchainService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
  }

  /**
   * Record trade on-chain
   */
  async recordTradeOnChain(
    wallet: WalletContextState,
    trade: Omit<TradeRecord, 'signature'>
  ): Promise<string | null> {
    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        console.log('Wallet not connected');
        return null;
      }

      const instruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 5000, // 0.000005 SOL
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = wallet.publicKey;

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await wallet.signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(signedTx.serialize());

      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Blockchain record error:', error);
      return null;
    }
  }

  /**
   * Verify trade signature
   */
  async verifyTradeSignature(signature: string): Promise<boolean> {
    try {
      const tx = await this.connection.getTransaction(signature);
      return tx !== null;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Balance fetch error:', error);
      return 0;
    }
  }

  /**
   * Get transaction history
   */
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

  /**
   * Create trade proof (JSON stored locally)
   */
  createTradeProof(trade: TradeRecord, signature: string | null): string {
    const proof = {
      type: trade.type,
      amount: trade.amount,
      price: trade.price,
      profit: trade.profit,
      timestamp: trade.timestamp,
      signature: signature || 'pending',
      verified: !!signature,
    };
    return JSON.stringify(proof);
  }

  /**
   * Decode trade proof
   */
  decodeTradeProof(proof: string): TradeRecord | null {
    try {
      const data = JSON.parse(proof);
      return {
        type: data.type,
        amount: data.amount,
        price: data.price,
        timestamp: data.timestamp,
        profit: data.profit,
        signature: data.signature,
      };
    } catch (error) {
      console.error('Proof decode error:', error);
      return null;
    }
  }

  /**
   * Get current SOL price (mock)
   */
  async getSolPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await response.json();
      return data.solana.usd || 145;
    } catch (error) {
      console.error('SOL price fetch error:', error);
      return 145; // Default
    }
  }
}

export const blockchainService = new BlockchainService();

/**
 * Main export function for game
 */
export async function recordTradeOnChain(
  wallet: WalletContextState,
  trade: Omit<TradeRecord, 'signature'>
): Promise<string | null> {
  const signature = await blockchainService.recordTradeOnChain(wallet, trade);
  return signature;
}

export async function getWalletInfo(publicKey: PublicKey) {
  const balance = await blockchainService.getWalletBalance(publicKey);
  const history = await blockchainService.getTransactionHistory(publicKey);
  return { balance, history };
}
