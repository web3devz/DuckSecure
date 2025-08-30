export interface AuditReport {
  contractAddress?: string;
  sourcecode?: string;
  summary: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    vulnerabilitiesFound: number;
    optimizationsFound: number;
    gasEfficiencyScore: number;
  };
  vulnerabilities: Vulnerability[];
  optimizations: Optimization[];
  gasAnalysis: GasAnalysis;
  recommendations: string[];
}

export interface Vulnerability {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  location: {
    line?: number;
    function?: string;
    contract?: string;
  };
  impact: string;
  recommendation: string;
  references: string[];
}

export interface Optimization {
  id: string;
  type: 'GAS' | 'LOGIC' | 'SECURITY';
  title: string;
  description: string;
  location: {
    line?: number;
    function?: string;
    contract?: string;
  };
  potentialSavings?: {
    gas?: number;
    percentage?: number;
  };
  implementation: string;
}

export interface GasAnalysis {
  totalGasUsed: number;
  deploymentCost: number;
  functionCosts: FunctionGasCost[];
  optimizationPotential: number;
}

export interface FunctionGasCost {
  name: string;
  gasUsed: number;
  optimizable: boolean;
  suggestions: string[];
}

export interface ContractMetadata {
  address: string;
  name: string;
  compiler: string;
  version: string;
  optimization: boolean;
  sourceCode: string;
  abi: any[];
  constructorArgs?: string;
  verified: boolean;
}

export interface ChainGPTResponse {
  success: boolean;
  data?: AuditReport;
  error?: string;
  usage?: {
    tokens: number;
    cost: number;
  };
}

export interface DuckChainTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed';
  timestamp: number;
}

export interface DuckTokenPayment {
  amount: string;
  type: 'one-time' | 'subscription';
  duration?: number; // in days for subscription
  transactionHash?: string;
}
