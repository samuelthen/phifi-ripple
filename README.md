# PhiFi - Decentralized Donation & Impact Tracking Platform

PhiFi is a decentralized donation and impact tracking platform built on the XRP Ledger (XRPL). It enables donors to make donations to verified NGOs and track their impact through NFT receipts, while NGOs can manage their funds and demonstrate transparency in their operations.

## Features

- 🧑 **Donor Features**
  - Create a testnet wallet
  - Donate XRP to verified NGOs
  - Receive NFT receipts for donations
  - Track impact of donations

- 🏢 **NGO Features**
  - Create a testnet wallet
  - Receive donations
  - Send funds to verified recipients
  - Add metadata for transparency

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: XRPL (XRP Ledger)
- **Development**: Node.js, npm

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Modern web browser with JavaScript enabled

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/phifi-ripple.git
   cd phifi-ripple
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── donor/             # Donor dashboard
│   ├── ngo/              # NGO dashboard
│   ├── donate/           # Donation page
│   └── page.tsx          # Home page
├── components/            # React components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   └── xrpl/             # XRPL-related utilities
└── data/                 # Mock data and types
```

## Development

- The application uses the XRPL Testnet for development and testing
- Testnet wallets are automatically funded with 50 XRP
- All transactions are simulated on the testnet
- No real XRP is used in the application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- XRP Ledger Foundation
- Ripple Hackathon Team
- Next.js Team
- Tailwind CSS Team
