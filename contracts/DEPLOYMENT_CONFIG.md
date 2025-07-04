# VonVault Smart Contract Deployment Configuration

## Contract Addresses (To be deployed)

### Ethereum Network
- **Contract Name**: VonVaultEthereumProcessor
- **Investment Wallet**: [YOUR_EXISTING_ETH_INVESTMENT_WALLET]
- **Operations Wallet**: [TO_BE_CREATED_ETH_OPERATIONS_WALLET]
- **Authorized Tokens**:
  - USDC: 0xA0b86a33E6441E7aFEa7E8DE4e8BD1000000000
  - USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7

### Polygon Network  
- **Contract Name**: VonVaultPolygonProcessor
- **Investment Wallet**: [YOUR_EXISTING_POLY_INVESTMENT_WALLET]
- **Operations Wallet**: [TO_BE_CREATED_POLY_OPERATIONS_WALLET]
- **Authorized Tokens**:
  - USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
  - USDT: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F

### BSC Network
- **Contract Name**: VonVaultBSCProcessor  
- **Investment Wallet**: [YOUR_EXISTING_BSC_INVESTMENT_WALLET]
- **Operations Wallet**: [TO_BE_CREATED_BSC_OPERATIONS_WALLET]
- **Authorized Tokens**:
  - USDC: 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
  - USDT: 0x55d398326f99059fF775485246999027B3197955

## Deployment Parameters

### Service Fee Configuration
- **Fee Rate**: 75 basis points (0.75%)
- **Max Fee Rate**: 200 basis points (2.00%)
- **Min Investment**: $1 (1e6 wei)
- **Max Investment**: $10,000,000 (10000000e6 wei)

### Security Features
- **Pausable**: Yes (emergency stop)
- **ReentrancyGuard**: Yes (prevents attacks)
- **Access Control**: Owner-only admin functions
- **Emergency Withdrawal**: Yes (when paused)

## Revenue Model

### Fee Distribution
- **99.25%** → VonVault Investment Wallet (your existing wallets)
- **0.75%** → VonVault Operations Wallet (new revenue wallets)

### Revenue Examples
- $1,000 investment → $7.50 fee → $992.50 invested
- $10,000 investment → $75.00 fee → $9,925.00 invested  
- $100,000 investment → $750.00 fee → $99,250.00 invested

## Deployment Checklist

### Pre-Deployment
- [ ] Create 3 operations wallets in TrustWallet
- [ ] Update deployment script with wallet addresses
- [ ] Verify token contract addresses for each network
- [ ] Prepare deployment gas fees (~$500 total for all networks)

### Post-Deployment  
- [ ] Authorize USDC and USDT tokens on each contract
- [ ] Test with small amounts ($10-100)
- [ ] Verify fee splitting works correctly
- [ ] Update frontend with contract addresses
- [ ] Monitor first real investments

## Gas Cost Estimates

### Deployment Costs
- **Ethereum**: ~$200-500 (depending on gas)
- **Polygon**: ~$5-20 (very cheap)
- **BSC**: ~$10-30 (cheap)
- **Total**: ~$215-550

### Transaction Costs (Paid by Users)
- **Ethereum**: ~$15-25 per investment
- **Polygon**: ~$0.01-0.10 per investment  
- **BSC**: ~$0.20-0.50 per investment

## Security Considerations

### Smart Contract Security
- OpenZeppelin contracts for standard security
- Reentrancy protection on all state-changing functions
- Input validation on all parameters
- Emergency pause functionality
- Owner-only admin functions

### Operational Security  
- Separate operations wallets for revenue collection
- Multi-signature option for high-value operations wallets
- Regular monitoring of contract events
- Backup plans for emergency situations

## Backend Integration Points

### Events to Monitor
- `InvestmentProcessed`: Main investment event
- `ServiceFeeCollected`: Revenue tracking event
- `ServiceFeeRateUpdated`: Fee changes
- `TokenAuthorizationUpdated`: Token management

### Database Schema Updates Required
```sql
-- Additional fields needed:
contract_address VARCHAR(42)
transaction_hash VARCHAR(66)
gross_amount DECIMAL(20,6)
service_fee DECIMAL(20,6)  
net_investment DECIMAL(20,6)
fee_rate INTEGER
processing_method VARCHAR(20)
network VARCHAR(20)
```

## Testing Strategy

### Testnet Testing
1. Deploy to Goerli, Mumbai, BSC Testnet
2. Test with testnet USDC/USDT
3. Verify fee calculations
4. Test emergency functions
5. Load testing with multiple investments

### Mainnet Testing
1. Start with Polygon (cheapest gas)
2. Test with small amounts ($10-100)
3. Verify operations wallet receives fees
4. Test backend integration
5. Expand to other networks

## Support Documentation

### For Users
- Clear explanation of 0.75% fee
- Network selection guide (gas cost differences)
- Wallet connection instructions
- Transaction confirmation process

### For Admin
- Contract interaction guide
- Fee adjustment procedures
- Emergency response procedures
- Revenue monitoring dashboard