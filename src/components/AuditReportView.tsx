'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, TrendingUp, Zap, ExternalLink, Download, Share2 } from 'lucide-react'
import { AuditReport, ContractMetadata, Vulnerability } from '@/types/audit'

interface AuditReportViewProps {
  report: AuditReport
  contractInfo?: ContractMetadata | null
}

export default function AuditReportView({ report, contractInfo }: AuditReportViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'vulnerabilities' | 'optimizations' | 'gas'>('summary')

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'LOW':
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'vulnerability-high'
      case 'MEDIUM':
        return 'vulnerability-medium'
      case 'LOW':
        return 'vulnerability-low'
      default:
        return 'bg-gray-50'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-600 bg-red-100'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100'
      case 'LOW':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const exportReport = () => {
    const reportData = {
      contract: contractInfo?.address || 'N/A',
      auditDate: new Date().toISOString(),
      report,
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-report-${contractInfo?.address || 'contract'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareReport = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Smart Contract Audit Report',
          text: `Audit report for contract ${contractInfo?.address || 'N/A'}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href)
      alert('Report link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Audit Report</h3>
          {contractInfo && (
            <p className="text-gray-600">
              Contract: {contractInfo.name} ({contractInfo.address.slice(0, 10)}...)
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportReport}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={shareReport}
            className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Risk</p>
              <p className={`text-lg font-bold px-2 py-1 rounded text-center ${getRiskColor(report.summary.overallRisk)}`}>
                {report.summary.overallRisk}
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${
              report.summary.overallRisk === 'HIGH' ? 'text-red-500' :
              report.summary.overallRisk === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
            }`} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vulnerabilities</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.vulnerabilitiesFound}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Optimizations</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.optimizationsFound}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gas Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{report.summary.gasEfficiencyScore}%</p>
            </div>
            <Zap className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'summary', label: 'Summary', count: null },
            { id: 'vulnerabilities', label: 'Vulnerabilities', count: report.vulnerabilities.length },
            { id: 'optimizations', label: 'Optimizations', count: report.optimizations.length },
            { id: 'gas', label: 'Gas Analysis', count: null },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-duck-500 text-duck-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="audit-report">
              <h4 className="text-lg font-semibold mb-4">Key Recommendations</h4>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="audit-report">
                <h4 className="text-lg font-semibold mb-4">Security Overview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Critical Issues:</span>
                    <span className="font-medium text-red-600">
                      {report.vulnerabilities.filter(v => v.severity === 'CRITICAL').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">High Risk Issues:</span>
                    <span className="font-medium text-red-600">
                      {report.vulnerabilities.filter(v => v.severity === 'HIGH').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium Risk Issues:</span>
                    <span className="font-medium text-yellow-600">
                      {report.vulnerabilities.filter(v => v.severity === 'MEDIUM').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Low Risk Issues:</span>
                    <span className="font-medium text-green-600">
                      {report.vulnerabilities.filter(v => v.severity === 'LOW').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="audit-report">
                <h4 className="text-lg font-semibold mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas Efficiency:</span>
                    <span className="font-medium">{report.summary.gasEfficiencyScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deployment Cost:</span>
                    <span className="font-medium">{report.gasAnalysis.deploymentCost.toLocaleString()} gas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Optimization Potential:</span>
                    <span className="font-medium">{report.gasAnalysis.optimizationPotential}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div className="space-y-4">
            {report.vulnerabilities.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Vulnerabilities Found</h4>
                <p className="text-gray-600">Great! Your contract appears to be secure.</p>
              </div>
            ) : (
              report.vulnerabilities.map((vuln) => (
                <div key={vuln.id} className={`p-4 rounded-lg ${getSeverityBg(vuln.severity)}`}>
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(vuln.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{vuln.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                          vuln.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{vuln.description}</p>
                      
                      {vuln.location && (
                        <div className="mb-3 text-sm text-gray-600">
                          <strong>Location:</strong>{' '}
                          {vuln.location.function && `Function: ${vuln.location.function}`}
                          {vuln.location.line && `, Line: ${vuln.location.line}`}
                          {vuln.location.contract && `, Contract: ${vuln.location.contract}`}
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <strong className="text-gray-900">Impact:</strong>
                        <p className="text-gray-700 mt-1">{vuln.impact}</p>
                      </div>
                      
                      <div className="mb-3">
                        <strong className="text-gray-900">Recommendation:</strong>
                        <p className="text-gray-700 mt-1">{vuln.recommendation}</p>
                      </div>
                      
                      {vuln.references.length > 0 && (
                        <div>
                          <strong className="text-gray-900">References:</strong>
                          <ul className="mt-1 space-y-1">
                            {vuln.references.map((ref, idx) => (
                              <li key={idx}>
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>{ref}</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div className="space-y-4">
            {report.optimizations.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Well Optimized</h4>
                <p className="text-gray-600">No obvious optimization opportunities found.</p>
              </div>
            ) : (
              report.optimizations.map((opt) => (
                <div key={opt.id} className="audit-report">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{opt.title}</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          opt.type === 'GAS' ? 'bg-green-100 text-green-800' :
                          opt.type === 'LOGIC' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {opt.type}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{opt.description}</p>
                      
                      {opt.location && (
                        <div className="mb-3 text-sm text-gray-600">
                          <strong>Location:</strong>{' '}
                          {opt.location.function && `Function: ${opt.location.function}`}
                          {opt.location.line && `, Line: ${opt.location.line}`}
                          {opt.location.contract && `, Contract: ${opt.location.contract}`}
                        </div>
                      )}
                      
                      {opt.potentialSavings && (
                        <div className="mb-3 text-sm">
                          <strong className="text-gray-900">Potential Savings:</strong>
                          <span className="ml-2 text-green-600 font-medium">
                            {opt.potentialSavings.gas && `${opt.potentialSavings.gas} gas`}
                            {opt.potentialSavings.percentage && ` (${opt.potentialSavings.percentage}%)`}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <strong className="text-gray-900">Implementation:</strong>
                        <p className="text-gray-700 mt-1">{opt.implementation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'gas' && (
          <div className="space-y-6">
            <div className="audit-report">
              <h4 className="text-lg font-semibold mb-4">Gas Usage Overview</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Gas Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.gasAnalysis.totalGasUsed.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Deployment Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.gasAnalysis.deploymentCost.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Optimization Potential</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.gasAnalysis.optimizationPotential}%
                  </p>
                </div>
              </div>
            </div>

            <div className="audit-report">
              <h4 className="text-lg font-semibold mb-4">Function Gas Costs</h4>
              <div className="space-y-3">
                {report.gasAnalysis.functionCosts.map((func, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{func.name}</span>
                      {func.optimizable && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Optimizable
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">
                      {func.gasUsed.toLocaleString()} gas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
