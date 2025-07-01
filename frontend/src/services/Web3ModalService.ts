// Reown AppKit Universal Wallet Service - 300+ Wallet Support
import { createAppKit } from '@reown/appkit'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { mainnet, arbitrum, polygon, optimism, base } from '@reown/appkit/networks'
import { BrowserProvider } from 'ethers'

// VonVault Reown AppKit Configuration
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

const metadata = {
  name: 'VonVault',
  description: 'VonVault DeFi Investment Platform',
  url: 'https://vonartis.app',
  icons: ['https://vonartis.app/favicon.ico']
}

// Initialize Reown AppKit with Ethers adapter
const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [mainnet, arbitrum, polygon, optimism, base],
  defaultNetwork: mainnet,
  projectId,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#9333ea', // VonVault purple
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#9333ea',
    '--w3m-border-radius-master': '8px',
  },
  enableAnalytics: false,
  includeWalletIds: [
    // Priority wallets for VonVault (same as before)
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Frame
  ]
})

// Interface for VonVault wallet connections (same as before)
export interface Web3ModalConnection {
  address: string
  chainId: number
  provider: BrowserProvider
  isConnected: boolean
  walletInfo?: {
    name: string
    icon: string
  }
}

class ReownAppKitService {
  private connection: Web3ModalConnection | null = null
  private connectedWallets: Web3ModalConnection[] = []

  constructor() {
    this.initializeListeners()
    this.loadStoredConnections()
  }

  // Initialize Reown AppKit event listeners
  private initializeListeners() {
    // Listen for connection events
    appKit.subscribeAccount((account) => {
      if (account.isConnected && account.address) {
        this.handleAccountChange(account.address, account.chainId)
      }
    })

    appKit.subscribeChainId((chainId) => {
      if (this.connection) {
        this.connection.chainId = chainId
        this.updateUserCryptoStatus()
      }
    })

    // Listen for provider state changes
    appKit.subscribeProvider((provider) => {
      if (provider.isConnected && provider.provider) {
        this.handleProviderConnection(provider.provider)
      } else {
        this.handleDisconnection()
      }
    })
  }

  // Handle account changes
  private async handleAccountChange(address: string, chainId?: number) {
    try {
      if (this.connection && this.connection.address.toLowerCase() === address.toLowerCase()) {
        if (chainId) {
          this.connection.chainId = chainId
        }
        this.updateUserCryptoStatus()
        return
      }

      // New account connection
      const provider = appKit.getProvider()
      if (provider) {
        await this.handleProviderConnection(provider, address, chainId)
      }
    } catch (error) {
      console.error('Error handling account change:', error)
    }
  }

  // Handle provider connection
  private async handleProviderConnection(provider: any, address?: string, chainId?: number) {
    try {
      const ethersProvider = new BrowserProvider(provider)
      
      if (!address) {
        const signer = await ethersProvider.getSigner()
        address = await signer.getAddress()
      }

      if (!chainId) {
        const network = await ethersProvider.getNetwork()
        chainId = Number(network.chainId)
      }

      const connection: Web3ModalConnection = {
        address,
        chainId,
        provider: ethersProvider,
        isConnected: true,
        walletInfo: {
          name: 'Connected Wallet',
          icon: '🦊'
        }
      }

      this.connection = connection
      this.addWalletConnection(connection)
      this.updateUserCryptoStatus()

      console.log('Reown AppKit connection established:', {
        address: address.slice(0, 6) + '...' + address.slice(-4),
        chain: chainId,
        wallet: connection.walletInfo?.name
      })

    } catch (error) {
      console.error('Error handling provider connection:', error)
    }
  }

  // Handle wallet disconnection
  private handleDisconnection() {
    this.connection = null
    this.updateUserCryptoStatus()
    console.log('Wallet disconnected')
  }

  // Public methods for VonVault integration (same API as before)
  
  // Open Reown AppKit connection interface
  async connectWallet(): Promise<Web3ModalConnection> {
    try {
      // Open the AppKit modal
      await appKit.open()
      
      // Wait for connection to be established
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'))
        }, 30000) // 30 second timeout

        const checkConnection = setInterval(() => {
          if (this.connection) {
            clearTimeout(timeout)
            clearInterval(checkConnection)
            resolve(this.connection)
          }
        }, 100)

        // Also listen for modal close without connection
        const handleModalClose = () => {
          clearTimeout(timeout)
          clearInterval(checkConnection)
          reject(new Error('Connection cancelled by user'))
        }

        // Set up close listener (if available)
        try {
          appKit.subscribeModal((state) => {
            if (!state.open && !this.connection) {
              handleModalClose()
            }
          })
        } catch (error) {
          // Fallback if subscribeModal doesn't exist
          console.log('Modal subscription not available, using timeout only')
        }
      })

    } catch (error: any) {
      console.error('Reown AppKit connection failed:', error)
      throw new Error(error.message || 'Failed to connect wallet')
    }
  }

  // Disconnect current wallet
  async disconnectWallet(): Promise<void> {
    try {
      await appKit.disconnect()
      this.connection = null
      this.updateUserCryptoStatus()
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      // Even if disconnect fails, clear our local state
      this.connection = null
      this.updateUserCryptoStatus()
    }
  }

  // Get current connection status
  getConnection(): Web3ModalConnection | null {
    return this.connection
  }

  // Get all connected wallets
  getConnectedWallets(): Web3ModalConnection[] {
    return [...this.connectedWallets]
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return !!this.connection?.isConnected
  }

  // Get wallet balance
  async getBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || this.connection?.address
      if (!targetAddress || !this.connection?.provider) {
        throw new Error('No wallet connected')
      }

      const balance = await this.connection.provider.getBalance(targetAddress)
      return balance.toString()
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  // Sign message
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.connection?.provider) {
        throw new Error('No wallet connected')
      }

      const signer = await this.connection.provider.getSigner()
      return await signer.signMessage(message)
    } catch (error) {
      console.error('Error signing message:', error)
      throw new Error('Failed to sign message')
    }
  }

  // Add manual wallet (for compatibility with existing VonVault system)
  async addManualWallet(address: string, name: string = 'Manual Wallet'): Promise<Web3ModalConnection> {
    try {
      // Validate address format
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid Ethereum address format')
      }

      // Check if wallet already exists
      const existing = this.connectedWallets.find(
        w => w.address.toLowerCase() === address.toLowerCase()
      )
      if (existing) {
        throw new Error('This wallet address is already connected')
      }

      // Create manual connection (view-only)
      const manualConnection: Web3ModalConnection = {
        address,
        chainId: 1, // Default to mainnet
        provider: new BrowserProvider(window.ethereum || {}),
        isConnected: true,
        walletInfo: {
          name,
          icon: '📝'
        }
      }

      this.addWalletConnection(manualConnection)
      return manualConnection

    } catch (error: any) {
      console.error('Manual wallet connection failed:', error)
      throw new Error(error.message || 'Failed to add manual wallet')
    }
  }

  // Private helper methods (same as before)

  private addWalletConnection(connection: Web3ModalConnection) {
    // Remove existing connection with same address
    this.connectedWallets = this.connectedWallets.filter(
      w => w.address.toLowerCase() !== connection.address.toLowerCase()
    )

    // Add new connection
    this.connectedWallets.push(connection)

    // Save to localStorage (without provider)
    this.saveConnections()
  }

  private saveConnections() {
    const storableConnections = this.connectedWallets.map(conn => ({
      address: conn.address,
      chainId: conn.chainId,
      isConnected: conn.isConnected,
      walletInfo: conn.walletInfo
    }))

    localStorage.setItem('reown_appkit_connections', JSON.stringify(storableConnections))
  }

  private loadStoredConnections() {
    try {
      const stored = localStorage.getItem('reown_appkit_connections')
      if (stored) {
        const connections = JSON.parse(stored)
        // Note: We can't restore the provider, so these become view-only
        this.connectedWallets = connections.map((conn: any) => ({
          ...conn,
          provider: null // Will need to reconnect for transactions
        }))
      }
    } catch (error) {
      console.error('Error loading stored connections:', error)
    }
  }

  // Update user crypto connection status (VonVault integration)
  private updateUserCryptoStatus() {
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        userData.crypto_connected = this.connectedWallets.length > 0
        userData.connected_wallets_count = this.connectedWallets.length
        userData.total_crypto_value = this.calculateTotalValue()
        
        localStorage.setItem('currentUser', JSON.stringify(userData))
      } catch (error) {
        console.error('Error updating user crypto status:', error)
      }
    }
  }

  // Calculate total crypto value (rough estimation)
  private calculateTotalValue(): number {
    // In production, you'd fetch real-time token prices
    const ethPrice = 3000 // Rough ETH price
    
    return this.connectedWallets.reduce((total, wallet) => {
      // This is a simplified calculation
      // In production, you'd fetch actual token balances and prices
      return total + 1000 // Placeholder value
    }, 0)
  }

  // Get AppKit instance (for advanced usage)
  getAppKit() {
    return appKit
  }
}

// Export singleton instance (same interface as before)
export const web3ModalService = new ReownAppKitService()
export type { Web3ModalConnection }