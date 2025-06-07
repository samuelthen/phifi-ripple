import { Client } from 'xrpl';

let client: Client | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000; // 2 seconds

export async function getTestnetClient(): Promise<Client> {
  if (client && client.isConnected()) {
    return client;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (client && client.isConnected()) {
      return client;
    }
  }

  try {
    isConnecting = true;
    reconnectAttempts = 0;

    if (client) {
      try {
        await client.disconnect();
      } catch (err) {
        console.error('Error disconnecting existing client:', err);
      }
    }

    client = new Client('wss://s.altnet.rippletest.net:51233');
    
    // Set up error handlers
    client.on('error', (error) => {
      console.error('XRPL client error:', error);
      handleReconnect();
    });

    client.on('disconnected', () => {
      console.log('XRPL client disconnected');
      handleReconnect();
    });

    await client.connect();
    console.log('XRPL client connected successfully');
    return client;
  } catch (error) {
    console.error('Error connecting to XRPL:', error);
    throw error;
  } finally {
    isConnecting = false;
  }
}

async function handleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached');
    return;
  }

  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  try {
    if (client) {
      await client.disconnect();
    }
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    await getTestnetClient();
  } catch (error) {
    console.error('Reconnection failed:', error);
  }
}

// Keep connection alive
setInterval(async () => {
  if (client && !client.isConnected()) {
    console.log('Connection lost, attempting to reconnect...');
    try {
      await getTestnetClient();
    } catch (error) {
      console.error('Failed to maintain connection:', error);
    }
  }
}, 30000); // Check every 30 seconds 