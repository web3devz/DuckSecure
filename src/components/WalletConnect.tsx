'use client'

import { useState, useEffect } from 'react'
import { Wallet, ChevronDown, LogOut, ExternalLink } from 'lucide-react'
import { blockchainService, DUCKCHAIN_CONFIG } from '@/lib/blockchain'
import {
  connectWithWalletConnect,
  disconnectWalletConnect,
  isWalletConnectConfigured,
} from '@/lib/walletConnect'

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [duckBalance, setDuckBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    checkConnection()
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (address) {
      loadDuckBalance()
    }
  }, [address])

  const checkConnection = async () => {
    try {
      const walletAddress = await blockchainService.getWalletAddress()
      if (walletAddress) {
        setAddress(walletAddress)
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAddress(null)
      setDuckBalance('0')
    } else {
      setAddress(accounts[0])
      setIsConnected(true)
    }
  }

  const handleChainChanged = () => {
    window.location.reload()
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      // Prefer EIP-1193 provider (window.ethereum) if present, otherwise try WalletConnect
      if (window.ethereum) {
        const { address: walletAddress } = await blockchainService.connectWallet()
        setAddress(walletAddress)
        setIsConnected(true)
      } else if (isWalletConnectConfigured()) {
        const { address: walletAddress } = await connectWithWalletConnect()
        setAddress(walletAddress)
        setIsConnected(true)
      } else {
        throw new Error('No injected wallet found and WalletConnect is not configured')
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
      alert('Failed to connect wallet. Please make sure you have a wallet installed or configure WalletConnect.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDuckBalance = async () => {
    if (!address) return

    try {
      const balance = await blockchainService.getDuckBalance(address)
      setDuckBalance(parseFloat(balance).toFixed(2))
    } catch (error) {
      console.error('Error loading DUCK balance:', error)
    }
  }

  const disconnectWallet = () => {
    // Best-effort disconnect from WalletConnect and reset UI
    try {
      disconnectWalletConnect()
    } catch (err) {
      // ignore
    }

    setIsConnected(false)
    setAddress(null)
    setDuckBalance('0')
    setShowDropdown(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const openExplorer = () => {
    if (address) {
      window.open(`${DUCKCHAIN_CONFIG.explorerUrl}/address/${address}`, '_blank')
    }
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-duck-400 hover:bg-duck-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-5 h-5" />
        <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg transition-all"
      >
        <div className="w-8 h-8 duck-gradient rounded-full flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {formatAddress(address!)}
          </div>
          <div className="text-xs text-gray-600">
            {duckBalance} DUCK
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 duck-gradient rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {formatAddress(address!)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Connected to DuckChain
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">DUCK Balance:</span>
                <span className="font-medium">{duckBalance} DUCK</span>
              </div>

              <button
                onClick={openExplorer}
                className="w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-gray-900 py-2 px-3 rounded hover:bg-gray-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>

              <button
                onClick={loadDuckBalance}
                className="w-full text-sm bg-duck-100 hover:bg-duck-200 text-duck-800 py-2 px-3 rounded transition-colors"
              >
                Refresh Balance
              </button>

              <hr className="border-gray-100" />

              <button
                onClick={disconnectWallet}
                className="w-full flex items-center justify-center space-x-2 text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
