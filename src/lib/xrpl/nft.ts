import { Client, Wallet, NFTokenMint } from 'xrpl';
import { getTestnetClient } from '@/lib/xrpl/client';

// --- Metadata Types ---
export type DonationReceiptMetadata = {
  ngoId: string;
  ngoName: string;
  amount: string;
  purpose: string;
  timestamp: number;
  impactWindow: number;
  category: string;
  txHash: string;
  donationId?: string; // Optional, set by donor dashboard
};

export type ImpactMetadata = {
  donationId: string; // Reference to original donation receipt NFT
  ngoId: string;
  ngoName: string;
  amount: string;
  category: string;
  recipient: string;
  timestamp: number;
  impactWindow: number;
  txHash: string;
  purpose: string;
  impactMetrics: {
    category: string;
    amount: string;
    percentage: number;
    description: string;
  }[];
};

export type NFTMetadata = DonationReceiptMetadata | ImpactMetadata;

// --- Validators & Sanitizers ---
export function validateDonationReceiptMetadata(metadata: any): metadata is DonationReceiptMetadata {
  return (
    typeof metadata === 'object' &&
    typeof metadata.ngoId === 'string' &&
    typeof metadata.ngoName === 'string' &&
    typeof metadata.amount === 'string' &&
    typeof metadata.purpose === 'string' &&
    typeof metadata.timestamp === 'number' &&
    typeof metadata.impactWindow === 'number' &&
    typeof metadata.category === 'string' &&
    typeof metadata.txHash === 'string'
  );
}

/**
 * Fill in defaults for missing ImpactMetadata fields and warn if legacy/malformed.
 */
export function sanitizeImpactMetadata(raw: any): ImpactMetadata {
  const meta: ImpactMetadata = {
    donationId:  typeof raw.donationId === 'string'
                  ? raw.donationId
                  : raw.txHash || '',
    ngoId:       typeof raw.ngoId === 'string'      ? raw.ngoId      : '',
    ngoName:     typeof raw.ngoName === 'string'    ? raw.ngoName    : '',
    amount:      String(raw.amount ?? '0'),
    category:    typeof raw.category === 'string'    ? raw.category   : 'unknown',
    recipient:   typeof raw.recipient === 'string'   ? raw.recipient  : 'Unknown',
    timestamp:   typeof raw.timestamp === 'number'   ? raw.timestamp  : Date.now(),
    impactWindow:typeof raw.impactWindow === 'number'? raw.impactWindow : 12 * 30 * 24 * 60 * 60 * 1000,
    txHash:      typeof raw.txHash === 'string'      ? raw.txHash     : '',
    purpose:     typeof raw.purpose === 'string'     ? raw.purpose    : 'Not specified',
    impactMetrics: Array.isArray(raw.impactMetrics)
                   ? raw.impactMetrics
                   : [{
                       category:   typeof raw.category === 'string' ? raw.category : 'unknown',
                       amount:     String(raw.amount ?? '0'),
                       percentage: 100,
                       description:`Funds allocated to ${typeof raw.recipient === 'string' ? raw.recipient : 'Unknown'}`
                     }]
  };

  // Log warnings for any out-of-spec types
  const warnings: string[] = [];
  if (typeof meta.donationId !== 'string') warnings.push(`donationId not string: ${meta.donationId}`);
  if (typeof meta.ngoId      !== 'string') warnings.push(`ngoId not string: ${meta.ngoId}`);
  if (typeof meta.ngoName    !== 'string') warnings.push(`ngoName not string: ${meta.ngoName}`);
  if (!Array.isArray(meta.impactMetrics)) warnings.push(`impactMetrics not array: ${meta.impactMetrics}`);
  if (warnings.length) {
    console.warn('sanitizeImpactMetadata warnings (legacy/malformed):', meta);
    warnings.forEach(w => console.warn(`  • ${w}`));
  }

  return meta;
}

// --- NFT Minting ---
export async function mintDonationReceipt(
  secret: string,
  metadata: DonationReceiptMetadata
): Promise<string> {
  if (!validateDonationReceiptMetadata(metadata)) {
    console.warn('mintDonationReceipt: malformed metadata, but proceeding:', metadata);
  }

  let attempts = 3;
  while (attempts-- > 0) {
    try {
      const client = await getTestnetClient();
      const wallet = Wallet.fromSecret(secret);
      const uri = Buffer.from(JSON.stringify(metadata)).toString('hex');

      const tx: NFTokenMint = {
        TransactionType: 'NFTokenMint',
        Account: wallet.address,
        URI: uri,
        Flags: 8,
        NFTokenTaxon: 0,
      };

      const resp = await client.submitAndWait(tx, { wallet });
      if (!resp.result.validated) throw new Error('Not validated');
      return resp.result.hash;
    } catch (e) {
      console.error('mintDonationReceipt error:', e);
      if (attempts <= 0) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('mintDonationReceipt failed');
}

export async function mintImpactNFT(
  secret: string,
  metadata: ImpactMetadata
): Promise<string> {
  // Sanitize incoming metadata so all fields exist
  const cleanMeta = sanitizeImpactMetadata(metadata);

  let attempts = 3;
  while (attempts-- > 0) {
    try {
      const client = await getTestnetClient();
      const wallet = Wallet.fromSecret(secret);
      const uri = Buffer.from(JSON.stringify(cleanMeta)).toString('hex');

      const tx: NFTokenMint = {
        TransactionType: 'NFTokenMint',
        Account: wallet.address,
        URI: uri,
        Flags: 8,
        NFTokenTaxon: 1,
      };

      const resp = await client.submitAndWait(tx, { wallet });
      if (!resp.result.validated) throw new Error('Not validated');
      return resp.result.hash;
    } catch (e) {
      console.error('mintImpactNFT error:', e);
      if (attempts <= 0) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('mintImpactNFT failed');
}

// --- Fetching NFTs ---
export async function getNFTs(address: string): Promise<any[]> {
  let attempts = 3;
  while (attempts-- > 0) {
    try {
      const client = await getTestnetClient();
      const resp = await client.request({ command: 'account_nfts', account: address });
      const raw = resp.result.account_nfts || [];
      await new Promise(r => setTimeout(r, 1000));

      return raw.map((nft: any) => {
        let parsed: any = {};
        try {
          if (nft.URI) parsed = JSON.parse(Buffer.from(nft.URI, 'hex').toString());
        } catch (e) {
          console.warn('getNFTs: failed parse URI, using empty:', nft.URI, e);
        }

        if (nft.NFTokenTaxon === 0) {
          if (!validateDonationReceiptMetadata(parsed)) {
            console.warn('getNFTs: invalid donation metadata, using raw:', parsed);
          }
          return { ...nft, metadata: parsed };
        }

        if (nft.NFTokenTaxon === 1) {
          const metadata = sanitizeImpactMetadata(parsed);
          return { ...nft, metadata };
        }

        return { ...nft, metadata: parsed };
      });
    } catch (e) {
      console.error('getNFTs error:', e);
      if (attempts <= 0) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return [];
}

export async function getDonorNFTs(address: string): Promise<any[]> {
  return (await getNFTs(address)).filter(nft => nft.NFTokenTaxon === 0);
}

export async function getImpactNFTs(address: string): Promise<any[]> {
  return (await getNFTs(address)).filter(nft => nft.NFTokenTaxon === 1);
}
