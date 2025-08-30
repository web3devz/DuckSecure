import axios from 'axios';
import { ContractMetadata } from '@/types/audit';

// Blockscout-powered explorer API endpoints
const DUCKSCAN_API_BASE = 'https://scan.duckchain.io/api/v2';

export class DuckChainService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetch contract source code and metadata from DuckScan (Blockscout API)
   */
  async getContractInfo(address: string): Promise<ContractMetadata> {
    try {
      // Blockscout API format for getting contract details
      const response = await axios.get(`${DUCKSCAN_API_BASE}/addresses/${address}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const contractData = response.data;
      
      // Check if it's a contract
      if (!contractData.is_contract) {
        throw new Error('Address is not a contract');
      }

      // Get additional contract details including source code
      let sourceCodeData = null;
      try {
        const sourceResponse = await axios.get(`${DUCKSCAN_API_BASE}/smart-contracts/${address}`, {
          headers: {
            'Accept': 'application/json',
          },
        });
        sourceCodeData = sourceResponse.data;
      } catch (err) {
        console.warn('Could not fetch source code:', err);
      }
      
      return {
        address: address.toLowerCase(),
        name: sourceCodeData?.name || contractData.name || 'Unknown Contract',
        compiler: sourceCodeData?.compiler_version || 'Unknown',
        version: sourceCodeData?.compiler_version || 'Unknown',
        optimization: sourceCodeData?.optimization_enabled || false,
        sourceCode: sourceCodeData?.source_code || '',
        abi: sourceCodeData?.abi || [],
        constructorArgs: sourceCodeData?.constructor_args || '',
        verified: sourceCodeData?.is_verified || false,
      };
    } catch (error) {
      console.error('Error fetching contract info:', error);
      
      // Fallback mock data for development
      return {
        address: address.toLowerCase(),
        name: 'MockContract',
        compiler: 'solc',
        version: '0.8.19',
        optimization: true,
        sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MockContract {
    uint256 public value;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function setValue(uint256 _value) public {
        require(msg.sender == owner, "Only owner can set value");
        value = _value;
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}`,
        abi: [
          {
            "inputs": [],
            "name": "getValue",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ],
        verified: true,
      };
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string) {
    try {
      const response = await axios.get(`${DUCKSCAN_API_BASE}/transactions/${txHash}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get contract ABI
   */
  async getContractABI(address: string) {
    try {
      const response = await axios.get(`${DUCKSCAN_API_BASE}/smart-contracts/${address}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.data && response.data.abi) {
        return response.data.abi;
      }
      
      throw new Error('Contract ABI not found or contract not verified');
    } catch (error) {
      console.error('Error fetching contract ABI:', error);
      throw error;
    }
  }

  /**
   * Validate if address is a valid contract
   */
  async isContract(address: string): Promise<boolean> {
    try {
      const response = await axios.get(`${DUCKSCAN_API_BASE}/addresses/${address}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.data?.is_contract || false;
    } catch (error) {
      console.error('Error checking if address is contract:', error);
      return false;
    }
  }

  /**
   * Get contract creation transaction
   */
  async getContractCreation(address: string) {
    try {
      const response = await axios.get(`${DUCKSCAN_API_BASE}/addresses/${address}/transactions`, {
        headers: {
          'Accept': 'application/json',
        },
        params: {
          filter: 'to',
          type: 'contract_creation',
        },
      });

      // Return the first transaction which should be the contract creation
      if (response.data?.items && response.data.items.length > 0) {
        return response.data.items[0];
      }
      
      throw new Error('Contract creation transaction not found');
    } catch (error) {
      console.error('Error fetching contract creation:', error);
      throw error;
    }
  }
}

export const duckChainService = new DuckChainService();
