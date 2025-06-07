import { Client, Wallet as XRPLWallet, xrpToDrops } from 'xrpl';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';
const BACKUP_TESTNET_URL = 'wss://s.altnet.rippletest.net:51234';

export async function createXRPLClient() {
  const client = new Client(TESTNET_URL, {
    connectionTimeout: 10000, // 10 seconds
    timeout: 20000, // 20 seconds
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.log('Primary testnet connection failed, trying backup...');
    const backupClient = new Client(BACKUP_TESTNET_URL, {
      connectionTimeout: 10000,
      timeout: 20000,
    });
    await backupClient.connect();
    return backupClient;
  }
}

export type UserWallet = {
  username: string;
  role: 'donor' | 'ngo';
  address: string;
  secret: string;
  balance: string;
};

export async function createTestnetWallet(username: string, role: 'donor' | 'ngo'): Promise<UserWallet> {
  const client = await createXRPLClient();

  try {
    // Generate new wallet
    const wallet = XRPLWallet.generate();
    
    // Fund the wallet using the testnet faucet
    const fundResponse = await client.fundWallet();
    const fundedWallet = fundResponse.wallet;

    // Get the wallet balance
    const balance = await client.getXrpBalance(fundedWallet.address);

    const userWallet: UserWallet = {
      username,
      role,
      address: fundedWallet.address,
      secret: fundedWallet.seed || '',
      balance: balance.toString(),
    };

    return userWallet;
  } finally {
    await client.disconnect();
  }
}

export async function getWalletBalance(address: string): Promise<string> {
  const client = await createXRPLClient();

  try {
    const balance = await client.getXrpBalance(address);
    return balance.toString();
  } finally {
    await client.disconnect();
  }
}

export async function sendXRP(
  fromSecret: string,
  toAddress: string,
  amount: string,
  memo?: string
): Promise<string> {
  const client = await createXRPLClient();
  let retries = 3;

  while (retries > 0) {
    try {
      const wallet = XRPLWallet.fromSeed(fromSecret);
      
      // Get the current ledger index
      const serverInfo = await client.request({
        command: 'server_info'
      });
      const currentLedgerIndex = serverInfo.result.info.complete_ledgers.split('-').pop();
      
      const prepared = await client.autofill({
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: xrpToDrops(amount),
        Destination: toAddress,
        LastLedgerSequence: Number(currentLedgerIndex) + 10, // Give 10 ledgers for the transaction to complete
        ...(memo && {
          Memos: [
            {
              Memo: {
                MemoData: Buffer.from(memo).toString('hex').toUpperCase(),
                MemoFormat: Buffer.from('text/plain').toString('hex').toUpperCase(),
              },
            },
          ],
        }),
      });

      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      if (result.result.validated) {
        return result.result.hash;
      }

      // If not validated, retry
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    } catch (error) {
      console.error(`Error sending XRP (attempt ${4 - retries}/3):`, error);
      retries--;
      if (retries === 0) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }

  throw new Error('Failed to send XRP after multiple attempts');
} 