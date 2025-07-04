// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VonVault Investment Processor
 * @dev Premium Smart Contract for VonVault DeFi Platform
 * @notice Processes investments with 0.75% service fee
 * @author VonVault Development Team
 */
contract VonVaultInvestmentProcessor is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STATE VARIABLES ============
    
    /// @notice VonVault investment wallet (receives 99.25% of investments)
    address public vonvaultInvestmentWallet;
    
    /// @notice VonVault operations wallet (receives 0.75% service fees)
    address public vonvaultOperationsWallet;
    
    /// @notice Service fee rate in basis points (75 = 0.75%)
    uint256 public serviceFeeRate = 75;
    
    /// @notice Fee denominator for percentage calculations (10000 = 100%)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    /// @notice Maximum allowed fee rate (200 = 2%)
    uint256 public constant MAX_FEE_RATE = 200;
    
    /// @notice Minimum investment amount (prevents dust attacks)
    uint256 public constant MIN_INVESTMENT = 1e6; // $1 minimum
    
    /// @notice Maximum investment amount (prevents whale manipulation)
    uint256 public constant MAX_INVESTMENT = 10000000e6; // $10M maximum
    
    // ============ STRUCTS ============
    
    /// @notice Investment record structure
    struct Investment {
        string investmentId;          // Unique investment identifier
        address investor;             // User who made the investment
        address tokenContract;        // USDC or USDT contract address
        uint256 grossAmount;          // Total amount user sent
        uint256 serviceFee;           // Fee deducted (0.75%)
        uint256 netInvestment;        // Amount actually invested (99.25%)
        uint256 timestamp;            // When investment was made
        uint256 blockNumber;          // Block number for verification
        bool processed;               // Whether backend has processed this
        string network;               // Network name (ethereum, polygon, bsc)
    }
    
    // ============ MAPPINGS ============
    
    /// @notice Investment records by investment ID
    mapping(string => Investment) public investments;
    
    /// @notice Authorized token contracts (USDC, USDT)
    mapping(address => bool) public authorizedTokens;
    
    /// @notice Total service fees collected by token
    mapping(address => uint256) public totalFeesCollected;
    
    /// @notice Total investments processed by token
    mapping(address => uint256) public totalInvestmentsProcessed;
    
    /// @notice User investment count
    mapping(address => uint256) public userInvestmentCount;
    
    // ============ EVENTS ============
    
    /// @notice Emitted when an investment is successfully processed
    event InvestmentProcessed(
        string indexed investmentId,
        address indexed investor,
        address indexed tokenContract,
        uint256 grossAmount,
        uint256 serviceFee,
        uint256 netInvestment,
        uint256 timestamp
    );
    
    /// @notice Emitted when service fee is collected
    event ServiceFeeCollected(
        address indexed investor,
        address indexed tokenContract,
        uint256 feeAmount,
        address operationsWallet
    );
    
    /// @notice Emitted when service fee rate is updated
    event ServiceFeeRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        address updatedBy
    );
    
    /// @notice Emitted when wallets are updated
    event WalletsUpdated(
        address oldInvestmentWallet,
        address newInvestmentWallet,
        address oldOperationsWallet,
        address newOperationsWallet
    );
    
    /// @notice Emitted when token authorization is updated
    event TokenAuthorizationUpdated(
        address indexed tokenContract,
        bool authorized
    );
    
    // ============ CONSTRUCTOR ============
    
    /// @notice Initialize the contract with wallet addresses
    /// @param _investmentWallet Address to receive 99.25% of investments
    /// @param _operationsWallet Address to receive 0.75% service fees
    constructor(
        address _investmentWallet,
        address _operationsWallet
    ) {
        require(_investmentWallet != address(0), "Invalid investment wallet");
        require(_operationsWallet != address(0), "Invalid operations wallet");
        require(_investmentWallet != _operationsWallet, "Wallets must be different");
        
        vonvaultInvestmentWallet = _investmentWallet;
        vonvaultOperationsWallet = _operationsWallet;
        
        // Transfer ownership to deployer
        _transferOwnership(msg.sender);
    }
    
    // ============ MAIN FUNCTIONS ============
    
    /// @notice Process investment with automatic 0.75% fee deduction
    /// @param investmentId Unique identifier for this investment
    /// @param tokenContract Address of USDC or USDT contract
    /// @param grossAmount Total amount user is investing (including fee)
    function processInvestment(
        string memory investmentId,
        address tokenContract,
        uint256 grossAmount
    ) external nonReentrant whenNotPaused {
        // Input validation
        require(bytes(investmentId).length > 0, "Invalid investment ID");
        require(grossAmount >= MIN_INVESTMENT, "Investment too small");
        require(grossAmount <= MAX_INVESTMENT, "Investment too large");
        require(authorizedTokens[tokenContract], "Token not authorized");
        require(investments[investmentId].investor == address(0), "Investment ID already exists");
        
        // Calculate fee split
        uint256 serviceFee = (grossAmount * serviceFeeRate) / FEE_DENOMINATOR;
        uint256 netInvestment = grossAmount - serviceFee;
        
        // Transfer total amount from user to this contract
        IERC20(tokenContract).transferFrom(msg.sender, address(this), grossAmount);
        
        // Forward net investment to VonVault investment wallet
        IERC20(tokenContract).transfer(vonvaultInvestmentWallet, netInvestment);
        
        // Forward service fee to VonVault operations wallet
        IERC20(tokenContract).transfer(vonvaultOperationsWallet, serviceFee);
        
        // Store investment record
        investments[investmentId] = Investment({
            investmentId: investmentId,
            investor: msg.sender,
            tokenContract: tokenContract,
            grossAmount: grossAmount,
            serviceFee: serviceFee,
            netInvestment: netInvestment,
            timestamp: block.timestamp,
            blockNumber: block.number,
            processed: false,
            network: getNetworkName()
        });
        
        // Update statistics
        totalFeesCollected[tokenContract] += serviceFee;
        totalInvestmentsProcessed[tokenContract] += netInvestment;
        userInvestmentCount[msg.sender] += 1;
        
        // Emit events
        emit InvestmentProcessed(
            investmentId,
            msg.sender,
            tokenContract,
            grossAmount,
            serviceFee,
            netInvestment,
            block.timestamp
        );
        
        emit ServiceFeeCollected(
            msg.sender,
            tokenContract,
            serviceFee,
            vonvaultOperationsWallet
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /// @notice Calculate service fee for a given amount
    /// @param amount Investment amount
    /// @return serviceFee Fee amount (0.75%)
    /// @return netInvestment Amount after fee deduction (99.25%)
    function calculateFee(uint256 amount) external view returns (
        uint256 serviceFee,
        uint256 netInvestment
    ) {
        serviceFee = (amount * serviceFeeRate) / FEE_DENOMINATOR;
        netInvestment = amount - serviceFee;
    }
    
    /// @notice Get investment details by ID
    /// @param investmentId Investment identifier
    /// @return investment Investment struct
    function getInvestment(string memory investmentId) external view returns (Investment memory) {
        return investments[investmentId];
    }
    
    /// @notice Get current service fee rate as percentage
    /// @return feePercentage Fee rate (e.g., 75 = 0.75%)
    function getServiceFeePercentage() external view returns (uint256) {
        return serviceFeeRate;
    }
    
    /// @notice Get network name for this deployment
    /// @return networkName Network identifier
    function getNetworkName() public view returns (string memory) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        
        if (chainId == 1) return "ethereum";
        if (chainId == 137) return "polygon";
        if (chainId == 56) return "bsc";
        if (chainId == 5) return "goerli";
        if (chainId == 80001) return "mumbai";
        if (chainId == 97) return "bsc-testnet";
        
        return "unknown";
    }
    
    /// @notice Get contract statistics
    /// @return totalInvestors Number of unique investors
    /// @return totalInvestments Total number of investments processed
    /// @return totalVolumeUSDC Total USDC volume processed
    /// @return totalVolumeUSDT Total USDT volume processed
    /// @return totalFeesUSDC Total USDC fees collected
    /// @return totalFeesUSDT Total USDT fees collected
    function getContractStats() external view returns (
        uint256 totalInvestors,
        uint256 totalInvestments,
        uint256 totalVolumeUSDC,
        uint256 totalVolumeUSDT,
        uint256 totalFeesUSDC,
        uint256 totalFeesUSDT
    ) {
        // This would require additional state tracking for efficiency
        // For now, return basic stats
        totalInvestors = 0; // Would need counter
        totalInvestments = 0; // Would need counter
        
        // Return stats for first two authorized tokens (assuming USDC/USDT)
        address[] memory tokens = getAuthorizedTokens();
        if (tokens.length >= 1) {
            totalVolumeUSDC = totalInvestmentsProcessed[tokens[0]];
            totalFeesUSDC = totalFeesCollected[tokens[0]];
        }
        if (tokens.length >= 2) {
            totalVolumeUSDT = totalInvestmentsProcessed[tokens[1]];
            totalFeesUSDT = totalFeesCollected[tokens[1]];
        }
    }
    
    /// @notice Get list of authorized tokens
    /// @return tokens Array of authorized token addresses
    function getAuthorizedTokens() public view returns (address[] memory) {
        // For efficiency in a real implementation, maintain an array
        // For now, this is a placeholder
        address[] memory tokens = new address[](0);
        return tokens;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /// @notice Update service fee rate (owner only)
    /// @param newRate New fee rate in basis points (max 200 = 2%)
    function updateServiceFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= MAX_FEE_RATE, "Fee rate too high");
        
        uint256 oldRate = serviceFeeRate;
        serviceFeeRate = newRate;
        
        emit ServiceFeeRateUpdated(oldRate, newRate, msg.sender);
    }
    
    /// @notice Update VonVault wallet addresses (owner only)
    /// @param newInvestmentWallet New investment wallet address
    /// @param newOperationsWallet New operations wallet address
    function updateWallets(
        address newInvestmentWallet,
        address newOperationsWallet
    ) external onlyOwner {
        require(newInvestmentWallet != address(0), "Invalid investment wallet");
        require(newOperationsWallet != address(0), "Invalid operations wallet");
        require(newInvestmentWallet != newOperationsWallet, "Wallets must be different");
        
        address oldInvestmentWallet = vonvaultInvestmentWallet;
        address oldOperationsWallet = vonvaultOperationsWallet;
        
        vonvaultInvestmentWallet = newInvestmentWallet;
        vonvaultOperationsWallet = newOperationsWallet;
        
        emit WalletsUpdated(
            oldInvestmentWallet,
            newInvestmentWallet,
            oldOperationsWallet,
            newOperationsWallet
        );
    }
    
    /// @notice Authorize or deauthorize a token (owner only)
    /// @param tokenContract Token contract address
    /// @param authorized Whether token is authorized
    function setTokenAuthorization(
        address tokenContract,
        bool authorized
    ) external onlyOwner {
        require(tokenContract != address(0), "Invalid token contract");
        
        authorizedTokens[tokenContract] = authorized;
        
        emit TokenAuthorizationUpdated(tokenContract, authorized);
    }
    
    /// @notice Mark an investment as processed by backend (owner only)
    /// @param investmentId Investment to mark as processed
    function markAsProcessed(string memory investmentId) external onlyOwner {
        require(investments[investmentId].investor != address(0), "Investment not found");
        investments[investmentId].processed = true;
    }
    
    /// @notice Emergency pause contract (owner only)
    function pause() external onlyOwner {
        _pause();
    }
    
    /// @notice Unpause contract (owner only)
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /// @notice Emergency withdrawal of stuck tokens (owner only)
    /// @param tokenContract Token to withdraw
    /// @param amount Amount to withdraw
    function emergencyWithdraw(
        address tokenContract,
        uint256 amount
    ) external onlyOwner {
        require(paused(), "Contract must be paused");
        IERC20(tokenContract).transfer(owner(), amount);
    }
}