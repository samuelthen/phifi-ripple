# PhiFi - Transparent Philanthropy on XRPL

[![XRPL Supported](https://img.shields.io/badge/Supported%20by-XRPL-blue)](https://xrpl.org)

PhiFi is a decentralized philanthropy platform built on the XRP Ledger that brings full transparency and traceability to charitable giving. By leveraging XRPL's NFT capabilities, PhiFi creates an immutable record of donations and their impact.

## 🌟 Vision

In philanthropy, the biggest problem isn't generosity — it's visibility. Donors give from the heart, but once funds leave their hands, the journey turns opaque. Where does the money go? Who actually benefits? Even NGOs struggle to report impact in a verifiable, transparent way.

PhiFi fixes this by using the XRP Ledger to bring full transparency and traceability to charitable giving.

## 🚀 Key Features

- **Instant NFT Receipts**: Donors receive NFT receipts minted on-chain with full metadata
- **Transparent Spending**: NGOs log all spending transactions on the ledger
- **Real-time Impact Tracking**: Donors can track their impact journey through the PhiFi dashboard
- **Verified NGOs**: All participating organizations are verified and accountable
- **Decentralized Architecture**: Built on XRPL for maximum transparency and security

## 📱 Platform Preview

### Donor Dashboard
![Donor Dashboard](/public/dashboard.png)
*Track your donations and impact in real-time*

### NGO Management
![NGO Page](/public/ngopage.png)
*Manage donations and demonstrate transparency*

## 🏗️ Architecture

PhiFi is architected with decentralization as the core principle:

| Component | Decentralization Method |
|-----------|------------------------|
| 💸 Donations | Direct to NGO XRPL wallets via client-side xrpl.js |
| 📜 NFT Receipts | Minted on XRPL using XLS-20 standard |
| 🧾 Spending | On-chain transactions with metadata |
| 📊 Dashboard | Real-time XRPL data reading |
| 🏦 Storage | All data on-chain, no database storage |

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Blockchain**: XRP Ledger (XRPL)
- **Smart Contracts**: XRPL NFT Standard (XLS-20)
- **Authentication**: Wallet-based authentication
- **State Management**: React Context + Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- XRPL Testnet account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/phifi.git
cd phifi
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 🔮 Future Roadmap

### Phase 1: Enhanced Decentralization
- [ ] Wallet custody integration
- [ ] Self-authenticated wallets
- [ ] XRPL Hooks for auto-minting
- [ ] XRPL DIDs for NGO verification
- [ ] Full client-side implementation

### Phase 2: Advanced Features
- [ ] DID Integration
- [ ] Auto NFT Minting
- [ ] Multisig NGO Wallets
- [ ] Impact Window Tracking
- [ ] AI Impact Storytelling
- [ ] Cross-Chain Donations
- [ ] Mobile Wallet Integration
- [ ] Media-Backed Spend Proofs
- [ ] iDAO Governance

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- XRPL Foundation for their support
- The open-source community
- All contributors and supporters

---

🌍 Give once. Track forever. Know your impact.
That's PhiFi.
