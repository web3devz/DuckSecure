import { ethers } from 'ethers';
import { DuckTokenPayment } from '@/types/audit';

// DuckChain Mainnet Configuration
export const DUCKCHAIN_CONFIG = {
  chainId: 0x584B5F4D, // DuckChain mainnet chain ID
  name: 'DuckChain Mainnet',
  currency: 'DUCK',
  rpcUrl: 'https://rpc.duckchain.io',
  explorerUrl: 'https://scan.duckchain.io',
};

// DUCK Token Contract Address
export const DUCK_TOKEN_ADDRESS = '0xdA65892eA771d3268610337E9964D916028B7dAD';

// ERC-20 ABI for DUCK token
export const DUCK_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Subscription Manager Contract ABI (basic implementation)
export const SUBSCRIPTION_ABI = [
  'function subscribe(uint256 duration) payable',
  'function getSubscription(address user) view returns (uint256 expiry, bool active)',
  'function isSubscriptionActive(address user) view returns (bool)',
  'function payWithDuck(uint256 amount, uint256 duration)',
  'event SubscriptionPurchased(address indexed user, uint256 duration, uint256 expiry)',
  'event AuditPurchased(address indexed user, uint256 amount)',
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private duckTokenContract: ethers.Contract | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeProvider();
    }
  }

  /**
   * Initialize provider and contracts
   */
  private async initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(DUCKCHAIN_CONFIG.rpcUrl);
      
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await browserProvider.getSigner();
        
        // Initialize DUCK token contract
        this.duckTokenContract = new ethers.Contract(
          DUCK_TOKEN_ADDRESS,
          DUCK_TOKEN_ABI,
          this.signer
        );
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  /**
   * Connect wallet and switch to DuckChain
   */
  async connectWallet(): Promise<{
    address: string;
    chainId: number;
  }> {
    if (!window.ethereum) {
      throw new Error('MetaMask or compatible wallet not found');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Switch to DuckChain network
      await this.switchToDuckChain();

      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16),
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Switch to DuckChain network
   */
  async switchToDuckChain(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Wallet not found');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${DUCKCHAIN_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await this.addDuckChainNetwork();
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Add DuckChain network to wallet
   */
  async addDuckChainNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('Wallet not found');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${DUCKCHAIN_CONFIG.chainId.toString(16)}`,
          chainName: DUCKCHAIN_CONFIG.name,
          rpcUrls: [DUCKCHAIN_CONFIG.rpcUrl],
          nativeCurrency: {
            name: DUCKCHAIN_CONFIG.currency,
            symbol: DUCKCHAIN_CONFIG.currency,
            decimals: 18,
          },
          blockExplorerUrls: [DUCKCHAIN_CONFIG.explorerUrl],
        },
      ],
    });
  }

  /**
   * Get DUCK token balance
   */
  async getDuckBalance(address: string): Promise<string> {
    if (!this.duckTokenContract || !this.provider) {
      await this.initializeProvider();
    }

    try {
      const contract = new ethers.Contract(
        DUCK_TOKEN_ADDRESS,
        DUCK_TOKEN_ABI,
        this.provider
      );
      
      const balance = await contract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching DUCK balance:', error);
      return '0';
    }
  }

  /**
   * Pay for one-time audit with DUCK tokens
   */
  async payForAudit(amount: string, recipient: string): Promise<DuckTokenPayment> {
    if (!this.duckTokenContract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      
      // Transfer DUCK tokens to payment processor
      const tx = await this.duckTokenContract.transfer(recipient, amountWei);
      await tx.wait();

      return {
        amount,
        type: 'one-time',
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }

  /**
   * Purchase subscription with DUCK tokens
   */
  async purchaseSubscription(
    amount: string,
    duration: number,
    subscriptionContract: string
  ): Promise<DuckTokenPayment> {
    if (!this.duckTokenContract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountWei = ethers.parseEther(amount);
      
      // First approve the subscription contract to spend DUCK tokens
      const approveTx = await this.duckTokenContract.approve(
        subscriptionContract,
        amountWei
      );
      await approveTx.wait();

      // Call subscription contract
      const subscriptionContractInstance = new ethers.Contract(
        subscriptionContract,
        SUBSCRIPTION_ABI,
        this.signer
      );

      const tx = await subscriptionContractInstance.payWithDuck(amountWei, duration);
      await tx.wait();

      return {
        amount,
        type: 'subscription',
        duration,
        transactionHash: tx.hash,
      };
    } catch (error) {
      console.error('Subscription purchase failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscription(userAddress: string, subscriptionContract: string): Promise<{
    active: boolean;
    expiry?: number;
  }> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    try {
      const contract = new ethers.Contract(
        subscriptionContract,
        SUBSCRIPTION_ABI,
        this.provider
      );

      const [expiry, active] = await contract.getSubscription(userAddress);
      
      return {
        active,
        expiry: active ? Number(expiry) : undefined,
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { active: false };
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    try {
      const gasPrice = await this.provider!.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return '0';
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(to: string, data: string, value?: string): Promise<string> {
    if (!this.provider) {
      await this.initializeProvider();
    }

    try {
      const gasEstimate = await this.provider!.estimateGas({
        to,
        data,
        value: value ? ethers.parseEther(value) : undefined,
      });
      
      return gasEstimate.toString();
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return '21000'; // Default gas limit
    }
  }

  /**
   * Get wallet address
   */
  async getWalletAddress(): Promise<string | null> {
    if (!window.ethereum) {
      return null;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });
      
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }
}

// Global blockchain service instance
export const blockchainService = new BlockchainService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
