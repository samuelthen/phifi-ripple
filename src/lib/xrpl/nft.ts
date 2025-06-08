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
  console.log('[mintDonationReceipt] Starting minting process with metadata:', metadata);
  const client = await getTestnetClient();
  const wallet = Wallet.fromSecret(secret);

  // Convert metadata to hex
  const metadataHex = Buffer.from(JSON.stringify(metadata)).toString('hex');
  console.log('[mintDonationReceipt] Metadata (hex):', metadataHex);

  // Mint NFT with taxon 0
  const tx: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    URI: metadataHex,
    Flags: 8, // transferable
    NFTokenTaxon: 0,
    Fee: '10', // Add explicit fee
    TransferFee: 0, // Add transfer fee
    Issuer: wallet.address, // Add issuer
  };

  console.log('[mintDonationReceipt] Preparing transaction:', tx);
  
  let retries = 3;
  while (retries > 0) {
    try {
      // Get the latest ledger index
      const serverInfo = await client.request({
        command: 'server_info'
      });
      const lastLedgerSequence = serverInfo.result.info.complete_ledgers.split('-')[1];
      
      // Add LastLedgerSequence with some buffer
      const autofilled = await client.autofill({
        ...tx,
        LastLedgerSequence: parseInt(lastLedgerSequence) + 10
      });
      
      console.log('[mintDonationReceipt] Autofilled transaction:', autofilled);
      console.log('[mintDonationReceipt] Submitting transaction...');

      // Submit the transaction without waiting for validation
      const response = await client.submit(autofilled, { wallet });
      console.log('[mintDonationReceipt] Transaction submitted:', response.result);

      if (response.result.engine_result === 'tesSUCCESS') {
        console.log('[mintDonationReceipt] Transaction successful');
        const hash = response.result.tx_json.hash;
        if (!hash) {
          throw new Error('Transaction hash not found in response');
        }
        return hash;
      } else {
        throw new Error(`Transaction failed with result: ${response.result.engine_result}`);
      }
    } catch (error: any) {
      console.error(`[mintDonationReceipt] Transaction failed (attempt ${4 - retries}/3):`, error);
      
      if (error.message?.includes('timeout') || 
          error.message?.includes('LastLedgerSequence') || 
          error.message?.includes('temMALFORMED')) {
        retries--;
        if (retries === 0) {
          console.error('[mintDonationReceipt] All retries failed');
          throw new Error('Failed to mint NFT after all retries: ' + error.message);
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Failed to mint NFT after all retries');
}

/**
 * Mint an NGO receipt NFT (NFTokenTaxon = 1)
 */
export async function mintNGOReceipt(
  secret: string,
  metadata: NFTMetadata
): Promise<string> {
  console.log('[mintNGOReceipt] Starting minting process with metadata:', metadata);
  const client = await getTestnetClient();
  const wallet = Wallet.fromSecret(secret);

  // Convert metadata to hex
  const metadataHex = Buffer.from(JSON.stringify(metadata)).toString('hex');
  console.log('[mintNGOReceipt] Metadata (hex):', metadataHex);

  // Mint NFT with taxon 1 to distinguish NGO-issued receipts
  const tx: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    URI: metadataHex,
    Flags: 8, // transferable
    NFTokenTaxon: 1,
  };

  console.log('[mintNGOReceipt] Preparing transaction:', tx);
  const autofilled = await client.autofill(tx);
  console.log('[mintNGOReceipt] Autofilled transaction:', autofilled);

  try {
    console.log('[mintNGOReceipt] Submitting transaction...');
    const response = await client.submitAndWait(autofilled, { wallet });
    console.log('[mintNGOReceipt] Transaction successful:', response.result);
    return response.result.hash;
  } catch (error) {
    console.error('[mintNGOReceipt] Transaction failed:', error);
    throw error;
  }
}


// Base NFT fetcher
export async function getNFTs(address: string): Promise<any[]> {
  console.log('[getNFTs] Fetching NFTs for address:', address);
  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`[getNFTs] Attempt ${4 - retries}/3`);
      const client = await getTestnetClient();
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const response = await Promise.race([
        client.request({
          command: 'account_nfts',
          account: address,
        }),
        timeoutPromise
      ]) as { result: { account_nfts?: any[] } };

      if (!response?.result?.account_nfts) {
        console.log('[getNFTs] No NFTs found for address:', address);
        return [];
      }

      const nfts = response.result.account_nfts.map((nft: any) => ({
        ...nft,
        URI: nft.URI ? Buffer.from(nft.URI, 'hex').toString() : null,
      }));

      console.log(`[getNFTs] Found ${nfts.length} NFTs for address:`, address);
      return nfts;
    } catch (error) {
      console.error(`[getNFTs] Error fetching NFTs (attempt ${4 - retries}/3):`, error);
      retries--;
      if (retries === 0) {
        console.warn('[getNFTs] All retries failed, returning empty array');
        return [];
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return [];
}

// Filters
export async function getDonorNFTs(address: string): Promise<any[]> {
  console.log('[getDonorNFTs] Fetching donor NFTs for address:', address);
  try {
    const nfts = await getNFTs(address);
    const donorNfts = nfts.filter(nft => nft.NFTokenTaxon === 0);
    console.log(`[getDonorNFTs] Found ${donorNfts.length} donor NFTs`);
    return donorNfts;
  } catch (error) {
    console.error('[getDonorNFTs] Error filtering donor NFTs:', error);
    return [];
  }
}

export async function getImpactNFTs(address: string): Promise<any[]> {
  console.log('[getImpactNFTs] Fetching impact NFTs for address:', address);
  try {
    const nfts = await getNFTs(address);
    const impactNfts = nfts.filter(nft => nft.NFTokenTaxon === 1);
    console.log(`[getImpactNFTs] Found ${impactNfts.length} impact NFTs`);
    return impactNfts;
  } catch (error) {
    console.error('[getImpactNFTs] Error filtering impact NFTs:', error);
    return [];
  }
}