#!/bin/bash

# VonVault Smart Contract Deployment Script
# Deploy VonVaultInvestmentProcessor to all three networks

echo "🚀 VonVault Smart Contract Deployment Starting..."
echo "Operations Wallet: 0xC7cbFBEfd24A362E4738Bc5693e6D9CF853787f4"
echo ""

# Network Configuration
OPERATIONS_WALLET="0xC7cbFBEfd24A362E4738Bc5693e6D9CF853787f4"

# You'll need to add your existing investment wallet addresses here:
ETHEREUM_INVESTMENT_WALLET="YOUR_EXISTING_ETH_INVESTMENT_WALLET"
POLYGON_INVESTMENT_WALLET="YOUR_EXISTING_POLY_INVESTMENT_WALLET"  
BSC_INVESTMENT_WALLET="YOUR_EXISTING_BSC_INVESTMENT_WALLET"

echo "📋 Deployment Configuration:"
echo "- Service Fee Rate: 0.75% (75 basis points)"
echo "- Operations Wallet: $OPERATIONS_WALLET"
echo "- Networks: Ethereum, Polygon, BSC"
echo ""

# Check if Hardhat is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: Node.js and npx are required for deployment"
    echo "Please install Node.js first: https://nodejs.org/"
    exit 1
fi

# Initialize Hardhat project if not exists
if [ ! -f "hardhat.config.js" ]; then
    echo "🔧 Initializing Hardhat project..."
    npx hardhat init --yes
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npm install @openzeppelin/contracts

# Create Hardhat config
cat > hardhat.config.js << EOF
require("@nomiclabs/hardhat-ethers");

// Replace with your actual private key (use environment variable in production)
const PRIVATE_KEY = process.env.DEPLOYMENT_PRIVATE_KEY || "your-private-key-here";

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    polygon: {
      url: "https://polygon-mainnet.alchemyapi.io/v2/YOUR_ALCHEMY_KEY",
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000, // 35 gwei
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org/",
      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // 5 gwei
    },
    ethereum: {
      url: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
      accounts: [PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
    }
  }
};
EOF

# Create deployment script
mkdir -p scripts
cat > scripts/deploy.js << EOF
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying VonVault Investment Processor...");
  
  // Get network name
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
  
  // Define wallet addresses based on network
  let investmentWallet;
  const operationsWallet = "$OPERATIONS_WALLET";
  
  switch(network.chainId) {
    case 1: // Ethereum
      investmentWallet = "$ETHEREUM_INVESTMENT_WALLET";
      break;
    case 137: // Polygon
      investmentWallet = "$POLYGON_INVESTMENT_WALLET";
      break;
    case 56: // BSC
      investmentWallet = "$BSC_INVESTMENT_WALLET";
      break;
    default:
      throw new Error("Unsupported network");
  }
  
  console.log("Investment Wallet:", investmentWallet);
  console.log("Operations Wallet:", operationsWallet);
  
  // Deploy contract
  const VonVaultProcessor = await ethers.getContractFactory("VonVaultInvestmentProcessor");
  const contract = await VonVaultProcessor.deploy(investmentWallet, operationsWallet);
  
  await contract.deployed();
  
  console.log("✅ Contract deployed to:", contract.address);
  console.log("📝 Transaction hash:", contract.deployTransaction.hash);
  
  // Authorize tokens after deployment
  console.log("🔧 Authorizing tokens...");
  
  let usdcAddress, usdtAddress;
  switch(network.chainId) {
    case 1: // Ethereum
      usdcAddress = "0xA0b86a33E6441E7aFEa7E8DE4e8BD1000000000";
      usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
      break;
    case 137: // Polygon
      usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
      usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
      break;
    case 56: // BSC
      usdcAddress = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
      usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
      break;
  }
  
  // Authorize USDC
  const usdcTx = await contract.setTokenAuthorization(usdcAddress, true);
  await usdcTx.wait();
  console.log("✅ USDC authorized");
  
  // Authorize USDT
  const usdtTx = await contract.setTokenAuthorization(usdtAddress, true);
  await usdtTx.wait();
  console.log("✅ USDT authorized");
  
  console.log("🎉 Deployment complete!");
  console.log("📋 Contract Details:");
  console.log("   Address:", contract.address);
  console.log("   Investment Wallet:", investmentWallet);
  console.log("   Operations Wallet:", operationsWallet);
  console.log("   Service Fee: 0.75%");
  console.log("   Authorized Tokens: USDC, USDT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
EOF

echo "✅ Deployment scripts created!"
echo ""
echo "🔑 NEXT STEPS:"
echo "1. Add your deployment private key to environment:"
echo "   export DEPLOYMENT_PRIVATE_KEY='your-private-key-here'"
echo ""
echo "2. Add your RPC URLs to hardhat.config.js (Alchemy/Infura keys)"
echo ""
echo "3. Add your existing investment wallet addresses to this script"
echo ""
echo "4. Deploy to Polygon first (cheapest gas):"
echo "   npx hardhat run scripts/deploy.js --network polygon"
echo ""
echo "5. Deploy to BSC:"
echo "   npx hardhat run scripts/deploy.js --network bsc"
echo ""
echo "6. Deploy to Ethereum:"
echo "   npx hardhat run scripts/deploy.js --network ethereum"
echo ""
echo "💰 Estimated gas costs:"
echo "   Polygon: ~\$5-20"
echo "   BSC: ~\$10-30"  
echo "   Ethereum: ~\$200-500"
echo "   Total: ~\$215-550"
echo ""
echo "🎉 After deployment, update the contract addresses in:"
echo "   - backend/.env"
echo "   - frontend/src/services/web3Service.js"
echo ""
echo "Your automated 0.75% revenue system will be LIVE!"