import { Client, Wallet as XRPLWallet } from 'xrpl';
import { createXRPLClient } from './wallet';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

export type DonationReceipt = {
  amount: string;
  ngoId: string;
  purpose: string;
  txHash: string;
  timestamp: number;
  impactWindow: number; // 12 months in milliseconds
};

export async function mintDonationReceipt(
  walletSecret: string,
  receipt: DonationReceipt
): Promise<string> {
  const client = await createXRPLClient();

  try {
    const wallet = XRPLWallet.fromSeed(walletSecret);

    // Prepare NFT metadata
    const metadata = {
      amount: receipt.amount,
      ngoId: receipt.ngoId,
      purpose: receipt.purpose,
      txHash: receipt.txHash,
      timestamp: receipt.timestamp,
      impactWindow: receipt.impactWindow,
    };

    // Mint NFT
    const prepared = await client.autofill({
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      URI: Buffer.from(JSON.stringify(metadata)).toString('hex').toUpperCase(),
      Flags: 8, // Transferable
      NFTokenTaxon: 0, // Required, but can be 0
    });

    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result.result.hash;
  } finally {
    await client.disconnect();
  }
}

export async function getNFTs(address: string): Promise<any[]> {
  const client = await createXRPLClient();

  try {
    const response = await client.request({
      command: 'account_nfts',
      account: address,
    });

    return response.result.account_nfts;
  } finally {
    await client.disconnect();
  }
} 