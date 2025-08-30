'use client'

import { useState, useRef } from 'react'
import { Code, Play, FileText, AlertTriangle, Upload, Clock } from 'lucide-react'
import { chainGPTService } from '@/lib/chaingpt'
import { AuditReport } from '@/types/audit'
import AuditReportView from './AuditReportView'

interface CodeEditorProps {
  onAuditRequest: (successCallback: () => void) => void
}

export default function CodeEditor({ onAuditRequest }: CodeEditorProps) {
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ExampleContract {
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
}`)
  
  const [isLoading, setIsLoading] = useState(false)
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'editing' | 'payment' | 'auditing' | 'complete'>('editing')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startAudit = async () => {
    if (!code.trim()) {
      setError('Please enter some Solidity code to audit')
      return
    }

    setIsLoading(true)
    setStep('auditing')
    setError(null)

    try {
      console.log('Starting code audit with code:', code.substring(0, 100) + '...')
      const result = await chainGPTService.auditContract({
        sourceCode: code,
      })

      console.log('Code audit result received:', result)

      if (result.success && result.data) {
        console.log('Setting code audit report:', result.data)
        setAuditReport(result.data)
        setStep('complete')
        console.log('Code audit step set to complete')
      } else {
        console.error('Code audit failed:', result.error || 'Unknown error')
        setError(result.error || 'Audit failed')
        setStep('payment')
      }
    } catch (err) {
      console.error('Code audit error:', err)
      setError('Audit process failed. Please try again.')
      setStep('payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    startAudit()
  }

  const resetEditor = () => {
    setAuditReport(null)
    setError(null)
    setStep('editing')
  }

  const loadSampleCode = (sample: string) => {
    const samples = {
      basic: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BasicContract {
    uint256 public value;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function setValue(uint256 _value) public {
        require(msg.sender == owner, "Only owner can set value");
        value = _value;
    }
}`,
      vulnerable: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VulnerableContract {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    // Vulnerable to reentrancy
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount; // State change after external call
    }
}`,
      erc20: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleToken {
    string public name = "SimpleToken";
    string public symbol = "STK";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10**decimals;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
}`
    }
    
    setCode(samples[sample as keyof typeof samples] || samples.basic)
  }

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.sol')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCode(content)
      }
      reader.readAsText(file)
    } else {
      setError('Please upload a Solidity (.sol) file')
    }
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract.sol'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Code className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Direct Code Audit</h3>
            <p className="text-gray-600">Paste or upload Solidity code for analysis</p>
          </div>
        </div>
        
        {step === 'complete' && (
          <button
            onClick={resetEditor}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            New Audit
          </button>
        )}
      </div>

      {step === 'editing' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sol"
                onChange={uploadFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload .sol</span>
              </button>
              
              <select
                onChange={(e) => loadSampleCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600"
              >
                <option value="">Load Sample...</option>
                <option value="basic">Basic Contract</option>
                <option value="vulnerable">Vulnerable Contract</option>
                <option value="erc20">ERC-20 Token</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Lines: {code.split('\n').length}
              </span>
              <button
                onClick={downloadCode}
                className="text-gray-600 hover:text-gray-900 p-1"
                title="Download code"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Code Editor */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourContract {
    // Your code here
}"
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              Solidity Editor
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>• Supports Solidity 0.8.0+</p>
              <p>• AI will analyze for security vulnerabilities and gas optimizations</p>
            </div>
            
            <button
              onClick={() => onAuditRequest(handlePaymentSuccess)}
              disabled={!code.trim()}
              className="flex items-center space-x-2 px-6 py-3 duck-gradient text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>Audit Code</span>
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
            <Code className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Audit</h4>
          <p className="text-gray-600 mb-6">
            Your code is ready for AI analysis. Payment required to proceed with the audit.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600">
              <p>Lines of code: {code.split('\n').length}</p>
              <p>Estimated analysis time: 30-60 seconds</p>
            </div>
          </div>
          <button
            onClick={() => onAuditRequest(handlePaymentSuccess)}
            className="px-8 py-3 duck-gradient text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {step === 'auditing' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-pulse-slow">
              <div className="w-16 h-16 duck-gradient rounded-full flex items-center justify-center">
                <Code className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">AI Audit in Progress</h4>
          <p className="text-gray-600 mb-4">ChainGPT is analyzing your Solidity code for security issues...</p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full animate-progress"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Processing Solidity code...</p>
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Usually takes 15-45 seconds</span>
          </div>
        </div>
      )}

      {step === 'complete' && auditReport && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">Code Audit Complete</h4>
          </div>

          <AuditReportView 
            report={auditReport}
            contractInfo={null}
          />
        </div>
      )}
    </div>
  )
}
