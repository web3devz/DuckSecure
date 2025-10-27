"use client"

import { Web3Modal } from "@walletconnect/web3modal"
import { ethers } from "ethers"

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

let web3modal: Web3Modal | null = null

function getWeb3Modal() {
  if (!web3modal) {
    web3modal = new Web3Modal({
      projectId: PROJECT_ID,
    })
  }
  return web3modal
}

export async function connectWithWalletConnect() {
  // Returns: { address, provider, ethersProvider, signer }
  try {
    if (!PROJECT_ID) {
      throw new Error('WalletConnect PROJECT_ID not configured. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
    }

    const modal = getWeb3Modal()
    const provider = await modal.connect()

    // Wrap provider with ethers BrowserProvider for v6
    const ethersProvider = new ethers.BrowserProvider(provider as any)
    const signer = await ethersProvider.getSigner()
    const address = await signer.getAddress()

    // Optionally expose the raw provider so callers can use request etc.
    return { address, provider, ethersProvider, signer }
  } catch (error) {
    console.error('connectWithWalletConnect error:', error)
    throw error
  }
}

export async function disconnectWalletConnect() {
  try {
    const modal = getWeb3Modal()
    // web3modal expose a disconnect method
    if ((modal as any).disconnect) {
      await (modal as any).disconnect()
    }
  } catch (error) {
    console.warn('disconnectWalletConnect warning:', error)
  }
}

export function isWalletConnectConfigured() {
  return !!PROJECT_ID
}
