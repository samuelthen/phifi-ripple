import { Client } from 'xrpl';

const TESTNET_URL = 'wss://s.altnet.rippletest.net:51233';

let client: Client | null = null;

export async function getTestnetClient(): Promise<Client> {
  if (!client) {
    client = new Client(TESTNET_URL);
    await client.connect();
  }
  return client;
} 