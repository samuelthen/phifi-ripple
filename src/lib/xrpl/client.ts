import { Client } from 'xrpl';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

let client: Client | null = null;
let isConnecting = false;

export async function getTestnetClient(): Promise<Client> {
  if (client?.isConnected()) {
    return client;
  }

  if (isConnecting) {
    // Wait for the existing connection attempt to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getTestnetClient();
  }

  try {
    isConnecting = true;
    if (!client) {
      client = new Client(TESTNET_URL);
    }
    
    if (!client.isConnected()) {
      await client.connect();
    }
    
    return client;
  } catch (error) {
    console.error('Error connecting to XRPL:', error);
    client = null;
    throw error;
  } finally {
    isConnecting = false;
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