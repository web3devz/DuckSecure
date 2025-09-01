# DuckSecure Auditor

🚀 **A decentralized dApp on DuckChain mainnet that uses ChainGPT AI to analyze smart contracts.**

Users pay in DUCK tokens for professional security auditing with one-time payments or subscription plans.

## ✨ Features

### 🔍 Smart Contract Address Audit
- Enter any verified contract address on DuckChain
- Automatically fetches source code and metadata from DuckScan Explorer
- Comprehensive AI-powered security analysis using ChainGPT
- Detailed vulnerability reports with severity ratings
- Gas optimization suggestions

### 📝 Direct Code Audit
- Monaco editor for pasting raw Solidity code
- Real-time syntax highlighting
- Upload .sol files directly
- Pre-loaded sample contracts for testing
- Perfect for auditing unpublished contracts

### 🤖 AI Security Assistant
- Interactive chatbot powered by ChainGPT AI
- Context-aware responses about your contracts
- Explains vulnerabilities in plain English
- Best practices and security recommendations
- Real-time Q&A about smart contract security

### 💰 DUCK Token Payments
- **One-time Audits**: Pay per contract analysis
- **Monthly Subscriptions**: Unlimited audits for 30 days
- Secure payments using DUCK ERC-20 tokens
- Smart contract-based subscription management
- Transparent pricing and usage tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Blockchain**: DuckChain Mainnet, Ethers.js v6
- **AI Integration**: ChainGPT Auditor API
- **Explorer**: DuckScan API integration
- **Wallet**: MetaMask, WalletConnect support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- DUCK tokens for payments

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd ducksecure-auditor
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_CHAINGPT_API_KEY=your_api_key_here
   NEXT_PUBLIC_SUBSCRIPTION_CONTRACT=deployed_contract_address
   NEXT_PUBLIC_PAYMENT_GATEWAY_CONTRACT=deployed_contract_address
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Contract Deployment

1. **Deploy Subscription Manager**
   ```solidity
   // contracts/SubscriptionManager.sol
   constructor(duckTokenAddress, treasuryAddress)
   ```

2. **Deploy Payment Gateway**
   ```solidity
   // contracts/PaymentGateway.sol
   constructor(duckTokenAddress, treasuryAddress, subscriptionManagerAddress)
   ```

3. **Update contract addresses in `.env.local`**

## 📋 Usage Guide

### For Users

1. **Connect Wallet**: Click "Connect Wallet" and approve DuckChain network
2. **Choose Audit Type**:
   - **Contract Address**: Paste verified contract address
   - **Direct Code**: Upload or paste Solidity code
3. **Select Payment**: One-time audit or monthly subscription
4. **Review Results**: Detailed security report with recommendations

### For Developers

1. **Contract Integration**: Use the Payment Gateway for access control
2. **API Integration**: ChainGPT endpoints for AI auditing
3. **Custom Reports**: Export and integrate audit results

## 🎯 Hackathon MVP Goals

- ✅ Landing page with contract audit functionality
- ✅ Code editor for direct Solidity analysis  
- ✅ AI chatbot for security assistance
- ✅ DUCK token payment system
- ✅ Subscription contract integration
- ✅ Real ChainGPT + DuckScan API integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart          │    │   External      │
│   (Next.js)     │◄──►│   Contracts      │    │   APIs          │
│                 │    │   (DuckChain)    │    │                 │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • Contract UI   │    │ • Subscription   │    │ • ChainGPT AI   │
│ • Code Editor   │    │ • Payment Gateway│    │ • DuckScan      │
│ • AI Chatbot    │    │ • Access Control │    │ • DUCK Token    │
│ • Wallet Connect│    │ • Revenue Track  │    │ • IPFS Storage  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 💳 Pricing

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| One-time Audit | 100 DUCK | Single use | 1 contract analysis |
| Monthly Subscription | 500 DUCK | 30 days | Unlimited audits |

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking

# Blockchain
npm run deploy       # Deploy smart contracts
npm run verify       # Verify on DuckScan
```

## 📁 Project Structure

```
ducksecure-auditor/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility libraries
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript definitions
├── contracts/               # Smart contracts
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Open a GitHub issues
---

**Built with ❤️ for the DuckChain ecosystem**
