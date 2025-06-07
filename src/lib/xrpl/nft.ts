import { Wallet, NFTokenMint } from 'xrpl';
import { getTestnetClient } from './client';

export type NFTMetadata = {
  ngoId?: string;
  ngoName?: string;
  amount: string;
  purpose: string;
  timestamp: number;
  impactWindow?: number; // optional timeframe for impact NFTs
  category?: string;
  recipient?: string;
  txHash?: string;
  wallet_address?: string;
};

/**
 * Mint a donor receipt NFT (NFTokenTaxon = 0)
 */
export async function mintDonationReceipt(
  secret: string,
  metadata: NFTMetadata
): Promise<string> {
  const client = await getTestnetClient();
  const wallet = Wallet.fromSecret(secret);

  // Convert metadata to hex
  const metadataHex = Buffer.from(JSON.stringify(metadata)).toString('hex');

  // Mint NFT with taxon 0
  const tx: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    URI: metadataHex,
    Flags: 8, // transferable
    NFTokenTaxon: 0,
  };

  const autofilled = await client.autofill(tx);
  const response = await client.submitAndWait(autofilled, { wallet });
  return response.result.hash;
}

/**
 * Mint an NGO receipt NFT (NFTokenTaxon = 1)
 */
export async function mintNGOReceipt(
  secret: string,
  metadata: NFTMetadata
): Promise<string> {
  const client = await getTestnetClient();
  const wallet = Wallet.fromSecret(secret);

  // Convert metadata to hex
  const metadataHex = Buffer.from(JSON.stringify(metadata)).toString('hex');

  // Mint NFT with taxon 1 to distinguish NGO-issued receipts
  const tx: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    URI: metadataHex,
    Flags: 8, // transferable
    NFTokenTaxon: 1,
  };

  const autofilled = await client.autofill(tx);
  const response = await client.submitAndWait(autofilled, { wallet });
  return response.result.hash;
}


// Base NFT fetcher
export async function getNFTs(address: string): Promise<any[]> {
  let retries = 3;
  while (retries > 0) {
    try {
      const client = await getTestnetClient();
      const response = await client.request({
        command: 'account_nfts',
        account: address,
      });

      if (!response.result.account_nfts) return [];

      return response.result.account_nfts.map((nft: any) => ({
        ...nft,
        URI: nft.URI ? Buffer.from(nft.URI, 'hex').toString() : null,
      }));
    } catch (error) {
      console.error(`Error fetching NFTs (attempt ${4 - retries}/3):`, error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return [];
}

// Filters
export async function getDonorNFTs(address: string): Promise<any[]> {
  const nfts = await getNFTs(address);
  return nfts.filter(nft => nft.NFTokenTaxon === 0); // Donor receipts
}

export async function getImpactNFTs(address: string): Promise<any[]> {
  const nfts = await getNFTs(address);
  return nfts.filter(nft => nft.NFTokenTaxon === 1); // Impact NFTs
}
