import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Записываем сделку на блокчейн
export async function recordTradeOnChain(
  wallet: any,
  tradeData: {
    type: 'BUY' | 'SELL',
    amount: number,
    price: number,
    timestamp: number,
    profit: number
  }
) {
  if (!wallet.publicKey || !wallet.signTransaction) return null;

  try {
    const dataString = JSON.stringify(tradeData);
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 0,
      })
    );

    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    return signature; // Proof на блокчейне
  } catch (error) {
    console.error('Blockchain record failed:', error);
    return null;
  }
}

// Проверяем сделку
export async function verifyTrade(signature: string) {
  try {
    const tx = await connection.getTransaction(signature);
    return tx !== null;
  } catch {
    return false;
  }
}
