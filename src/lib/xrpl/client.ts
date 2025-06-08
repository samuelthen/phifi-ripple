import { Client } from 'xrpl';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

let client: Client | null = null;
let isConnecting = false;

export async function getTestnetClient(): Promise<Client> {
  if (client?.isConnected()) {
    console.log('[getTestnetClient] Using existing connected client');
    return client;
  }

  console.log('[getTestnetClient] Initializing new XRPL client');
  client = new Client(TESTNET_URL);
  
  try {
    console.log('[getTestnetClient] Connecting to XRPL testnet...');
    await client.connect();
    console.log('[getTestnetClient] Successfully connected to XRPL testnet');
    return client;
  } catch (error) {
    console.error('[getTestnetClient] Failed to connect to XRPL testnet:', error);
    throw error;
  }
}

// Keep the connection alive
setInterval(async () => {
  try {
    const client = await getTestnetClient();
    if (!client.isConnected()) {
      await client.connect();
    }
  } catch (error) {
    console.error('Error maintaining XRPL connection:', error);
  }
}, 30000); // Check connection every 30 seconds 