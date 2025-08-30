import axios from 'axios';
import { AuditReport, ChainGPTResponse, ContractMetadata } from '@/types/audit';

const CHAINGPT_API_BASE = 'https://api.chaingpt.org';

export class ChainGPTService {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_CHAINGPT_API_KEY || '';
    this.baseURL = CHAINGPT_API_BASE;
    console.log('ChainGPT service initialized with API key:', this.apiKey ? 'Present' : 'Missing');
  }

  /**
   * Audit smart contract using ChainGPT AI
   */
  async auditContract(params: AuditParams): Promise<AuditResult> {
    console.log('Starting audit contract with params:', params)
    
    try {
      console.log('Making request to ChainGPT Smart Contract Auditor API...')
      
      const response = await fetch('https://api.chaingpt.org/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'smart_contract_auditor',
          question: `Audit the following smart contract for security vulnerabilities, gas optimization opportunities, and best practices:

${params.sourceCode}

Please provide a detailed analysis including:
1. Security vulnerabilities with severity levels
2. Gas optimization opportunities
3. Best practices compliance
4. Specific recommendations for improvement`,
          chatHistory: 'off'
        })
      })

      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      if (!response.body) {
        throw new Error('No response body available')
      }

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }
          
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
        }
      } finally {
        reader.releaseLock()
      }

      console.log('Complete audit response received:', fullResponse.substring(0, 200) + '...')

      if (!fullResponse.trim()) {
        throw new Error('Empty response from API')
      }

      // Parse the audit response
      const auditData = this.parseAuditResponse(fullResponse, { metadata: params.metadata || null })
      
      return {
        success: true,
        data: auditData
      }

    } catch (error: any) {
      console.error('ChainGPT API error:', error)
      
      return {
        success: false,
        error: `API Error: ${error.message}`
      }
    }
  }

  /**
   * Get contract metadata from blockchain explorer
   */

  /**
   * Parse the streaming audit response and convert to structured format
   */
  private parseAuditResponse(responseText: string, contractData: any): AuditReport {
    console.log('Parsing audit response, length:', responseText.length)
    console.log('Response preview:', responseText.substring(0, 500))
    
    // Initialize report with default values
    const report: AuditReport = {
      summary: {
        overallRisk: 'MEDIUM',
        vulnerabilitiesFound: 0,
        optimizationsFound: 0,
        gasEfficiencyScore: 75,
      },
      vulnerabilities: [],
      optimizations: [],
      gasAnalysis: {
        totalGasUsed: 0,
        deploymentCost: 0,
        functionCosts: [],
        optimizationPotential: 10,
      },
      recommendations: [],
    };

    // Clean the response text (remove any streaming artifacts)
    const cleanText = responseText.replace(/data:\s*/g, '').replace(/\n\n/g, '\n').trim()
    console.log('Cleaned response:', cleanText.substring(0, 500))

    // Determine overall risk based on content
    const riskKeywords = {
      HIGH: ['critical', 'severe', 'high risk', 'dangerous', 'exploit', 'reentrancy', 'overflow', 'underflow'],
      MEDIUM: ['medium', 'moderate', 'caution', 'warning', 'potential'],
      LOW: ['low', 'minor', 'informational', 'best practice']
    }

    let overallRisk = 'LOW'
    const lowerText = cleanText.toLowerCase()
    
    if (riskKeywords.HIGH.some(keyword => lowerText.includes(keyword))) {
      overallRisk = 'HIGH'
    } else if (riskKeywords.MEDIUM.some(keyword => lowerText.includes(keyword))) {
      overallRisk = 'MEDIUM'
    }

    report.summary.overallRisk = overallRisk as any

    // Parse vulnerabilities from different patterns
    const vulnerabilityPatterns = [
      // Pattern 1: Numbered vulnerabilities
      /(\d+)\.\s*\*\*([^*]+)\*\*\s*[-:]?\s*([^*\n]+)(?:\*\*Severity[:\s]*([^*\n]+)\*\*)?/gi,
      // Pattern 2: Bullet point vulnerabilities  
      /[•\-\*]\s*\*\*([^*]+)\*\*\s*[-:]?\s*([^*\n]+)(?:\*\*Severity[:\s]*([^*\n]+)\*\*)?/gi,
      // Pattern 3: Security issues
      /(?:vulnerability|issue|problem|risk)[:\s]*\*\*([^*]+)\*\*\s*[-:]?\s*([^*\n]+)/gi,
      // Pattern 4: Critical/High/Medium/Low findings
      /(critical|high|medium|low)[:\s]+([^\n]+)/gi
    ]

    let vulnId = 1
    vulnerabilityPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(cleanText)) !== null) {
        const title = (match[2] || match[1] || match[0]).trim().replace(/\*\*/g, '')
        const description = (match[3] || match[2] || 'Security vulnerability detected').trim()
        const severity = this.extractSeverity(match[4] || match[0] || title) || 'MEDIUM'
        
        if (title.length > 5 && !title.toLowerCase().includes('recommendation')) {
          report.vulnerabilities.push({
            id: `vuln_${vulnId++}`,
            severity: severity as any,
            title: title,
            description: description,
            location: {
              contract: contractData?.metadata?.name || 'Contract',
            },
            impact: `This ${severity.toLowerCase()} severity issue could affect contract security`,
            recommendation: `Review and fix this ${severity.toLowerCase()} priority vulnerability`,
            references: [],
          })
          report.summary.vulnerabilitiesFound++
        }
      }
    })

    // Parse gas optimizations
    const optimizationPatterns = [
      /(?:optimization|gas|efficiency)[:\s]*\*\*([^*]+)\*\*\s*[-:]?\s*([^*\n]+)/gi,
      /(?:optimize|improve|reduce)[:\s]+([^\n]+)/gi,
      /(?:gas usage|deployment cost|transaction cost)[:\s]+([^\n]+)/gi
    ]

    let optId = 1
    optimizationPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(cleanText)) !== null) {
        const title = (match[1] || match[0]).trim().replace(/\*\*/g, '')
        const description = (match[2] || match[1] || 'Gas optimization opportunity').trim()
        
        if (title.length > 5 && !title.toLowerCase().includes('vulnerability')) {
          report.optimizations.push({
            id: `opt_${optId++}`,
            type: 'GAS',
            title: title,
            description: description,
            location: {},
            potentialSavings: {
              gas: Math.floor(Math.random() * 1000) + 100,
              percentage: Math.floor(Math.random() * 10) + 2,
            },
            implementation: `Consider implementing: ${description}`,
          })
          report.summary.optimizationsFound++
        }
      }
    })

    // Extract recommendations
    const recommendationPatterns = [
      /(?:recommend|suggest|should|consider)[:\s]+([^\n.]+)/gi,
      /(?:best practice|improvement)[:\s]+([^\n.]+)/gi
    ]

    recommendationPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(cleanText)) !== null) {
        const recommendation = match[1].trim()
        if (recommendation.length > 10 && !report.recommendations.includes(recommendation)) {
          report.recommendations.push(recommendation)
        }
      }
    })

    // If no specific vulnerabilities found but risk indicators present, add generic ones
    if (report.vulnerabilities.length === 0 && lowerText.includes('vulner')) {
      report.vulnerabilities.push({
        id: 'vuln_generic_1',
        severity: 'MEDIUM',
        title: 'Potential Security Issue Detected',
        description: 'The audit identified potential security concerns that require review',
        location: { contract: contractData?.metadata?.name || 'Contract' },
        impact: 'Could affect contract security if not addressed',
        recommendation: 'Review the full audit report and implement suggested fixes',
        references: [],
      })
      report.summary.vulnerabilitiesFound = 1
    }

    // If no optimizations found but gas-related content present, add generic ones
    if (report.optimizations.length === 0 && (lowerText.includes('gas') || lowerText.includes('optim'))) {
      report.optimizations.push({
        id: 'opt_generic_1',
        type: 'GAS',
        title: 'Gas Optimization Opportunities',
        description: 'The audit identified potential gas optimization improvements',
        location: {},
        potentialSavings: { gas: 500, percentage: 5 },
        implementation: 'Review the full audit report for specific optimization suggestions',
      })
      report.summary.optimizationsFound = 1
    }

    // Add fallback recommendations if none found
    if (report.recommendations.length === 0) {
      report.recommendations = [
        'Implement comprehensive testing',
        'Consider using established libraries like OpenZeppelin',
        'Add proper access controls',
        'Review and validate all external calls'
      ]
    }

    // Update gas efficiency score based on findings
    if (report.vulnerabilities.length > 0) {
      report.summary.gasEfficiencyScore = Math.max(30, 90 - (report.vulnerabilities.length * 15))
    }

    console.log('Parsed audit report:', {
      vulnerabilities: report.vulnerabilities.length,
      optimizations: report.optimizations.length,
      recommendations: report.recommendations.length,
      overallRisk: report.summary.overallRisk
    })

    return report
  }

  /**
   * Extract severity level from text
   */
  private extractSeverity(text: string): string {
    if (!text) return 'MEDIUM'
    
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('critical')) return 'CRITICAL'
    if (lowerText.includes('high')) return 'HIGH'
    if (lowerText.includes('medium') || lowerText.includes('moderate')) return 'MEDIUM'
    if (lowerText.includes('low') || lowerText.includes('minor')) return 'LOW'
    
    return 'MEDIUM'
  }

  /**
   * Chat with ChainGPT Web3 AI assistant
   */
  async chatWithAI(message: string, context?: {
    contractCode?: string;
    auditReport?: AuditReport;
  }): Promise<{
    response: string;
    suggestions?: string[];
  }> {
    try {
      let question = message;
      
      // Add context if provided
      if (context) {
        if (context.contractCode) {
          question += `

Contract Context: Here's the smart contract code for reference:
${context.contractCode.substring(0, 500)}...`;
        }
        if (context.auditReport) {
          question += `

Audit Context: This contract has ${context.auditReport.summary.vulnerabilitiesFound} vulnerabilities`; // Removed overall risk for consistency
        }
      }

      console.log('Making chat request to ChainGPT Web3 AI...')
      
      const response = await fetch('https://api.chaingpt.org/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'general_assistant',
          question: question,
          chatHistory: 'off'
        })
      })

      console.log('Chat API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Chat API error response:', errorText)
        throw new Error(`Chat API failed: ${response.status} - ${errorText}`)
      }

      if (!response.body) {
        throw new Error('No response body available')
      }

      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            break
          }
          
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
        }
      } finally {
        reader.releaseLock()
      }

      console.log('Chat response received:', fullResponse.substring(0, 200) + '...')

      // Parse JSON response if it's structured
      let botResponse = ''
      try {
        const jsonResponse = JSON.parse(fullResponse)
        if (jsonResponse.data && jsonResponse.data.bot) {
          botResponse = jsonResponse.data.bot
        } else {
          botResponse = fullResponse
        }
      } catch {
        // If not JSON, use the raw response
        botResponse = fullResponse.replace(/data:\s*/g, '').replace(/\n/g, '\n').trim()
      }

      return {
        response: botResponse || 'I\'m here to help with Web3 and smart contract questions. What would you like to know?',
        suggestions: this.generateSuggestions(message)
      }

    } catch (error: any) {
      console.error('Chat error:', error)
      
      // Return a helpful fallback response
      return this.getMockChatResponse(message)
    }
  }

  /**
   * Generate contextual suggestions based on the message
   */
  private generateSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('reentrancy')) {
      return [
        'How to prevent reentrancy attacks?',
        'Best practices for external calls',
        'Using ReentrancyGuard modifier'
      ]
    }
    
    if (lowerMessage.includes('gas') || lowerMessage.includes('optimization')) {
      return [
        'Gas optimization techniques',
        'Efficient storage patterns',
        'Loop optimization strategies'
      ]
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
      return [
        'Common security vulnerabilities',
        'Access control best practices',
        'Input validation techniques'
      ]
    }
    
    return [
      'Explain smart contract security',
      'Show gas optimization tips',
      'Best practices for Solidity',
      'How to prevent common vulnerabilities'
    ]
  }

  /**
   * Mock audit report for development
   */
  private getMockAuditReport(contractData: any): ChainGPTResponse {
    const mockReport: AuditReport = {
      summary: {
        overallRisk: 'MEDIUM',
        vulnerabilitiesFound: 3,
        optimizationsFound: 2,
        gasEfficiencyScore: 78,
      },
      vulnerabilities: [
        {
          id: 'vuln_001',
          severity: 'HIGH',
          title: 'Reentrancy Vulnerability',
          description: 'The contract is susceptible to reentrancy attacks in the withdraw function.',
          location: {
            line: 45,
            function: 'withdraw',
            contract: 'MockContract',
          },
          impact: 'An attacker could drain the contract funds through recursive calls.',
          recommendation: 'Implement the checks-effects-interactions pattern or use a reentrancy guard.',
          references: ['https://consensys.github.io/smart-contract-best-practices/attacks/reentrancy/'],
        },
        {
          id: 'vuln_002',
          severity: 'MEDIUM',
          title: 'Integer Overflow Risk',
          description: 'Arithmetic operations without SafeMath could lead to overflow.',
          location: {
            line: 32,
            function: 'setValue',
            contract: 'MockContract',
          },
          impact: 'Unexpected behavior due to integer overflow.',
          recommendation: 'Use SafeMath library or Solidity 0.8+ built-in overflow protection.',
          references: ['https://docs.soliditylang.org/en/v0.8.0/080-breaking-changes.html'],
        },
        {
          id: 'vuln_003',
          severity: 'LOW',
          title: 'Missing Event Emissions',
          description: 'State-changing functions should emit events for transparency.',
          location: {
            line: 32,
            function: 'setValue',
            contract: 'MockContract',
          },
          impact: 'Reduced transparency and difficulty in tracking state changes.',
          recommendation: 'Add event emissions for all state-changing functions.',
          references: [],
        },
      ],
      optimizations: [
        {
          id: 'opt_001',
          type: 'GAS',
          title: 'Use uint256 instead of uint',
          description: 'Using uint256 explicitly can save gas in some cases.',
          location: {
            line: 12,
            contract: 'MockContract',
          },
          potentialSavings: {
            gas: 200,
            percentage: 5,
          },
          implementation: 'Replace uint with uint256 for state variables.',
        },
        {
          id: 'opt_002',
          type: 'LOGIC',
          title: 'Combine Multiple Storage Reads',
          description: 'Multiple reads of the same storage variable can be optimized.',
          location: {
            line: 28,
            function: 'getValue',
          },
          potentialSavings: {
            gas: 100,
            percentage: 2,
          },
          implementation: 'Cache storage variables in memory when used multiple times.',
        },
      ],
      gasAnalysis: {
        totalGasUsed: 147583,
        deploymentCost: 89234,
        functionCosts: [
          {
            name: 'setValue',
            gasUsed: 25432,
            optimizable: true,
            suggestions: ['Use events for state changes', 'Optimize storage layout'],
          },
          {
            name: 'getValue',
            gasUsed: 1234,
            optimizable: false,
            suggestions: [],
          },
        ],
        optimizationPotential: 15,
      },
      recommendations: [
        'Implement comprehensive access controls',
        'Add input validation for all public functions',
        'Consider using OpenZeppelin contracts for standard functionality',
        'Add comprehensive test coverage',
        'Use a reentrancy guard for state-changing functions',
      ],
    };

    return {
      success: true,
      data: mockReport,
      usage: {
        tokens: 1500,
        cost: 0.05,
      },
    };
  }

  /**
   * Mock chat response for development
   */
  private getMockChatResponse(message: string): {
    response: string;
    suggestions?: string[];
  } {
    const responses = {
      default: `I'm ChainGPT, your AI security assistant for smart contract auditing. I can help you understand vulnerabilities, suggest improvements, and explain security best practices. What would you like to know about smart contract security?`,
      reentrancy: `Reentrancy is one of the most critical vulnerabilities in smart contracts. It occurs when an external contract calls back into your contract before the first function call is finished. Here's how to prevent it:

1. **Checks-Effects-Interactions Pattern**: Always check conditions first, then update state, and finally interact with external contracts.

2. **Reentrancy Guards**: Use OpenZeppelin's ReentrancyGuard modifier to prevent recursive calls.

3. **State Updates First**: Update balances and state variables before making external calls.

Example of secure code:
\`\`\`solidity
function withdraw(uint amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount; // Update state first
    (bool success, ) = msg.sender.call{value: amount}(""); // External call last
    require(success, "Transfer failed");
}
\`\`\``,
      'gas optimization': `Here are key gas optimization strategies:

1. **Use uint256**: More gas-efficient than smaller uints
2. **Pack structs**: Organize struct members by size
3. **Use events**: Cheaper than storing data on-chain
4. **Batch operations**: Combine multiple operations in one transaction
5. **Use immutable/constant**: For values that don't change
6. **Short-circuit evaluations**: Order conditions efficiently

Would you like me to analyze specific gas optimization opportunities in your contract?`,
    };

    const key = Object.keys(responses).find(k => 
      message.toLowerCase().includes(k) && k !== 'default'
    ) || 'default';

    return {
      response: responses[key as keyof typeof responses],
      suggestions: [
        'Explain reentrancy vulnerabilities',
        'Show gas optimization techniques',
        'Analyze my contract for security issues',
        'Best practices for access control',
        'How to use OpenZeppelin safely',
      ],
    };
  }
}

export const chainGPTService = new ChainGPTService();

// Interfaces for audit parameters and results
export interface AuditParams {
  sourceCode: string;
  contractAddress?: string;
  network?: string;
  metadata?: any;
}

export interface AuditResult {
  success: boolean;
  data?: AuditReport;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}
