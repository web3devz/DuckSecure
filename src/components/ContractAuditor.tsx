'use client'

import { useState } from 'react'
import { Search, FileText, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import { duckChainService } from '@/lib/duckchain'
import { chainGPTService } from '@/lib/chaingpt'
import { ContractMetadata, AuditReport } from '@/types/audit'
import AuditReportView from './AuditReportView'

interface ContractAuditorProps {
  onAuditRequest: (successCallback: () => void) => void
}

export default function ContractAuditor({ onAuditRequest }: ContractAuditorProps) {
  const [contractAddress, setContractAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [contractInfo, setContractInfo] = useState<ContractMetadata | null>(null)
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'input' | 'fetching' | 'payment' | 'auditing' | 'complete'>('input')

  const validateAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const fetchContractInfo = async () => {
    if (!validateAddress(contractAddress)) {
      setError('Please enter a valid contract address')
      return
    }

    setIsLoading(true)
    setError(null)
    setStep('fetching')

    try {
      const info = await duckChainService.getContractInfo(contractAddress)
      
      if (!info.verified) {
        setError('Contract source code is not verified on DuckScan. Please verify your contract first.')
        setStep('input')
        return
      }

      setContractInfo(info)
      setStep('payment')
    } catch (err) {
      setError('Failed to fetch contract information. Please check the address and try again.')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const startAudit = async () => {
    if (!contractInfo) return

    setIsLoading(true)
    setStep('auditing')
    setError(null)

    try {
      console.log('Starting audit with contract info:', contractInfo)
      const result = await chainGPTService.auditContract({
        sourceCode: contractInfo.sourceCode,
        contractAddress: contractInfo.address,
        metadata: contractInfo,
      })

      console.log('Audit result received:', result)

      if (result.success && result.data) {
        console.log('Setting audit report:', result.data)
        setAuditReport(result.data)
        setStep('complete')
        console.log('Step set to complete')
      } else {
        console.error('Audit failed:', result.error || 'Unknown error')
        setError(result.error || 'Audit failed')
        setStep('payment')
      }
    } catch (err) {
      console.error('Audit error:', err)
      setError('Audit process failed. Please try again.')
      setStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    startAudit()
  }

  const resetAudit = () => {
    setContractAddress('')
    setContractInfo(null)
    setAuditReport(null)
    setError(null)
    setStep('input')
  }

  const openInExplorer = () => {
    if (contractAddress) {
      window.open(`https://scan.duckchain.io/address/${contractAddress}`, '_blank')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Search className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Contract Address Audit</h3>
          <p className="text-gray-600">Enter a verified contract address on DuckChain to audit</p>
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="contract-address" className="block text-sm font-medium text-gray-700 mb-2">
              Contract Address
            </label>
            <div className="flex space-x-3">
              <input
                id="contract-address"
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={fetchContractInfo}
                disabled={!contractAddress || isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Fetching...' : 'Fetch Info'}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Contract must be deployed on DuckChain mainnet</li>
              <li>• Source code must be verified on DuckScan</li>
              <li>• Valid Ethereum address format (0x...)</li>
            </ul>
          </div>
        </div>
      )}

      {step === 'fetching' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Fetching Contract Information</h4>
          <p className="text-gray-600">Retrieving source code and metadata from DuckScan...</p>
        </div>
      )}

      {step === 'payment' && contractInfo && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-900">Contract Found & Verified</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{contractInfo.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Compiler:</span>
                <span className="ml-2 font-medium">{contractInfo.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Optimization:</span>
                <span className="ml-2 font-medium">{contractInfo.optimization ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="text-gray-600">Source Lines:</span>
                <span className="ml-2 font-medium">{contractInfo.sourceCode.split('\n').length}</span>
              </div>
            </div>

            <div className="mt-3 flex space-x-3">
              <button
                onClick={openInExplorer}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Ready to audit this contract with ChainGPT AI. Payment required to proceed.
            </p>
            <button
              onClick={() => onAuditRequest(handlePaymentSuccess)}
              className="px-8 py-3 duck-gradient text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {step === 'auditing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-pulse-slow">
              <div className="w-16 h-16 duck-gradient rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">AI Audit in Progress</h4>
          <p className="text-gray-600 mb-4">ChainGPT is analyzing your smart contract for security vulnerabilities...</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-progress"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Analyzing contract security...</p>
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>This may take 30-60 seconds</span>
          </div>
        </div>
      )}

      {step === 'complete' && auditReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h4 className="text-lg font-medium text-gray-900">Audit Complete</h4>
            </div>
            <button
              onClick={resetAudit}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              New Audit
            </button>
          </div>

          <AuditReportView 
            report={auditReport}
            contractInfo={contractInfo}
          />
        </div>
      )}
    </div>
  )
}
