'use client'

import React, { useState, useEffect } from 'react'
import { X, Wallet, Clock, Star, Shield, CreditCard } from 'lucide-react'
import { blockchainService } from '@/lib/blockchain'
import { UserAuditTracker } from '@/lib/userAuditTracker'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  auditType: 'contract' | 'code'
  onSuccess?: () => void
}

export default function PaymentModal({ isOpen, onClose, auditType, onSuccess }: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<'free-check' | 'payment-type' | 'processing' | 'success' | 'error'>('free-check')
  const [selectedPlan, setSelectedPlan] = useState<'one-time' | 'subscription' | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [address, setAddress] = useState<string>('')
  const [freeAuditsRemaining, setFreeAuditsRemaining] = useState(0)
  const [canUseFreeAudit, setCanUseFreeAudit] = useState(false)

  // Predefined pricing (no ChainGPT API calls)
  const PRICING = {
    oneTime: 100, // 100 DUCK tokens
    subscription: 500 // 500 DUCK tokens (monthly)
  }

  useEffect(() => {
    if (isOpen) {
      checkFreeAudits()
      checkWalletConnection()
    }
  }, [isOpen])

  const checkFreeAudits = () => {
    const remaining = UserAuditTracker.getFreeAuditsRemaining()
    setFreeAuditsRemaining(remaining)
    setCanUseFreeAudit(remaining > 0)
    
    if (remaining > 0) {
      setCurrentStep('free-check')
    } else {
      setCurrentStep('payment-type')
    }
  }

  const checkWalletConnection = async () => {
    try {
      const userAddress = await blockchainService.getWalletAddress()
      if (userAddress) {
        const userBalance = await blockchainService.getDuckBalance(userAddress)
        setAddress(userAddress)
        setBalance(userBalance)
      }
    } catch (err) {
      console.error('Error checking wallet:', err)
    }
  }

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      const result = await blockchainService.connectWallet()
      const userBalance = await blockchainService.getDuckBalance(result.address)
      setAddress(result.address)
      setBalance(userBalance)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleUseFreeAudit = () => {
    try {
      UserAuditTracker.useFreeAudit()
      setCurrentStep('success')
    } catch (err: any) {
      setError(err.message || 'Failed to use free audit')
      setCurrentStep('error')
    }
  }

  const handlePayment = async () => {
    if (!selectedPlan) return

    setIsProcessing(true)
    setError(null)
    setCurrentStep('processing')

    try {
      const amount = selectedPlan === 'one-time' ? PRICING.oneTime : PRICING.subscription
      // Use a placeholder recipient address for now - this should be configured
      const recipientAddress = '0x1234567890123456789012345678901234567890'
      const result = await blockchainService.payForAudit(amount.toString(), recipientAddress)
      
      if (result.transactionHash) {
        // Record the paid audit
        UserAuditTracker.recordPaidAudit()
        setCurrentStep('success')
      } else {
        throw new Error('Payment failed')
      }
    } catch (err: any) {
      setError(err.message || 'Payment processing failed')
      setCurrentStep('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setCurrentStep('free-check')
      setSelectedPlan(null)
      setError(null)
      onClose()
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Free Audit Check Step */}
        {currentStep === 'free-check' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Audit Available!</h2>
            <p className="text-gray-600 mb-6">
              You have <span className="font-semibold text-green-600">{freeAuditsRemaining}</span> free audits remaining.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleUseFreeAudit}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Use Free Audit
              </button>
              
              <button
                onClick={() => setCurrentStep('payment-type')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Choose Paid Plan Instead
              </button>
            </div>
          </div>
        )}

        {/* Payment Type Selection Step */}
        {currentStep === 'payment-type' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">
                {canUseFreeAudit 
                  ? `You have ${freeAuditsRemaining} free audits remaining, or choose a paid plan below.`
                  : 'Select a payment plan to continue with your audit.'
                }
              </p>
            </div>

            {/* Plan Options */}
            <div className="space-y-4 mb-6">
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === 'one-time'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('one-time')}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">One-Time Audit</h3>
                    <p className="text-sm text-gray-600">Single audit session</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{PRICING.oneTime}</div>
                    <div className="text-sm text-gray-600">DUCK</div>
                  </div>
                </div>
              </div>

              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan === 'subscription'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan('subscription')}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Monthly Subscription</h3>
                    <p className="text-sm text-gray-600">Unlimited audits for 30 days</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{PRICING.subscription}</div>
                    <div className="text-sm text-gray-600">DUCK/month</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            {!address ? (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </>
                )}
              </button>
            ) : (
              <div>
                {/* Wallet Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-blue-700">Your Balance:</span>
                    <span className="font-semibold text-blue-900">{balance} DUCK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Address:</span>
                    <span className="font-mono text-blue-900">{formatAddress(address)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={!selectedPlan || parseFloat(balance) < (selectedPlan === 'one-time' ? PRICING.oneTime : PRICING.subscription)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  {selectedPlan ? `Pay ${selectedPlan === 'one-time' ? PRICING.oneTime : PRICING.subscription} DUCK` : 'Select a Plan'}
                </button>

                {selectedPlan && parseFloat(balance) < (selectedPlan === 'one-time' ? PRICING.oneTime : PRICING.subscription) && (
                  <p className="text-red-600 text-sm text-center mt-2">
                    Insufficient balance. You need {selectedPlan === 'one-time' ? PRICING.oneTime : PRICING.subscription} DUCK.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Processing Step */}
        {currentStep === 'processing' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we process your payment...
            </p>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Ready!</h2>
            <p className="text-gray-600 mb-6">
              Your audit access has been activated. You can now proceed with your {auditType} audit.
            </p>
            <button
              onClick={() => {
                onSuccess?.()
                handleClose()
              }}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Start Audit
            </button>
          </div>
        )}

        {/* Error Step */}
        {currentStep === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              {error || 'An error occurred while processing your payment.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setCurrentStep(canUseFreeAudit ? 'free-check' : 'payment-type')}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
