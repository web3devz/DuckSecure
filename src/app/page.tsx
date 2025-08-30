'use client'

import { useState } from 'react'
import { Shield, Code, MessageCircle } from 'lucide-react'
import ContractAuditor from '@/components/ContractAuditor'
import CodeEditor from '@/components/CodeEditor'
import ChatBot from '@/components/ChatBot'
import WalletConnect from '@/components/WalletConnect'
import PaymentModal from '@/components/PaymentModal'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const [activeTab, setActiveTab] = useState('landing')
  const [showPayment, setShowPayment] = useState(false)
  const [auditType, setAuditType] = useState<'contract' | 'code'>('contract')
  const [auditSuccessCallback, setAuditSuccessCallback] = useState<(() => void) | null>(null)

  const handleGetStarted = () => {
    setActiveTab('audit')
  }

  const handleAuditRequest = (type: 'contract' | 'code', successCallback?: () => void) => {
    setAuditType(type)
    setAuditSuccessCallback(() => successCallback)
    setShowPayment(true)
  }

  const handlePaymentSuccess = () => {
    setShowPayment(false)
    if (auditSuccessCallback) {
      auditSuccessCallback()
      setAuditSuccessCallback(null)
    }
  }

  if (activeTab === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center cursor-pointer"
                onClick={() => setActiveTab('landing')}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DuckSecure Auditor</h1>
                <p className="text-xs text-gray-600">AI-Powered Smart Contract Security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleAuditRequest('contract')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 text-sm font-medium"
              >
                Subscribe
              </button>
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'audit'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Contract Auditor</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'editor'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code className="w-5 h-5" />
              <span>Code Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'chat'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'audit' && (
          <div className="animate-fade-in">
            <ContractAuditor onAuditRequest={(successCallback) => handleAuditRequest('contract', successCallback)} />
          </div>
        )}
        {activeTab === 'editor' && (
          <div className="animate-fade-in">
            <CodeEditor onAuditRequest={(successCallback) => handleAuditRequest('code', successCallback)} />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="animate-fade-in">
            <ChatBot />
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal 
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          auditType={auditType}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
