'use client'

import { useState } from 'react'
import { Shield, Code, MessageCircle, Zap, CheckCircle, ArrowRight, Star, Users, TrendingUp, ExternalLink, Github, Twitter } from 'lucide-react'
import WalletConnect from '@/components/WalletConnect'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Security Analysis",
      description: "Advanced ChainGPT AI analyzes your smart contracts for vulnerabilities, security issues, and optimization opportunities.",
      details: [
        "Comprehensive vulnerability detection",
        "Severity-based risk assessment", 
        "Real-time security recommendations",
        "Industry-standard compliance checks"
      ]
    },
    {
      icon: Code,
      title: "Smart Contract Intelligence",
      description: "Upload contracts or paste code directly for instant analysis with detailed reports and actionable insights.",
      details: [
        "Support for verified DuckChain contracts",
        "Direct Solidity code analysis",
        "Gas optimization suggestions",
        "Best practices enforcement"
      ]
    },
    {
      icon: MessageCircle,
      title: "Expert AI Assistant",
      description: "Get instant answers about smart contract security from our ChainGPT-powered assistant chatbot.",
      details: [
        "Natural language security explanations",
        "Context-aware vulnerability insights",
        "Educational security guidance",
        "24/7 expert assistance"
      ]
    }
  ]

  const stats = [
    { label: "Security Checks", value: "50+", icon: Shield },
    { label: "Contracts Analyzed", value: "1000+", icon: Code },
    { label: "Vulnerabilities Found", value: "500+", icon: TrendingUp },
    { label: "Developers Protected", value: "100+", icon: Users }
  ]

  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Protocol Founder",
      content: "DuckSecure saved us from a critical reentrancy vulnerability before our mainnet launch. The AI analysis is incredibly thorough.",
      rating: 5
    },
    {
      name: "Sarah Kim", 
      role: "Smart Contract Developer",
      content: "The gas optimization suggestions alone saved our project thousands in deployment costs. Highly recommended!",
      rating: 5
    },
    {
      name: "Michael Torres",
      role: "Security Researcher", 
      content: "Finally, an audit platform that explains vulnerabilities in plain English. Perfect for both beginners and experts.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DuckSecure</h1>
                <p className="text-xs text-gray-600">AI-Powered Security</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Reviews</a>
            </nav>

            <div className="flex items-center space-x-4">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              <span>Powered by ChainGPT AI on DuckChain</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Secure Your <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Smart Contracts</span> with AI
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed">
              Professional smart contract auditing powered by ChainGPT AI. 
              Detect vulnerabilities, optimize gas usage, and secure your DeFi projects 
              before deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free Audit
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                <ExternalLink className="w-5 h-5 mr-2" />
                View Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-3">
                    <stat.icon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Smart Contract Security
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI-powered analysis, expert insights, and actionable recommendations 
              to keep your smart contracts secure and optimized.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-white shadow-lg border-2 border-yellow-200'
                      : 'bg-white/50 hover:bg-white hover:shadow-md border-2 border-transparent'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      activeFeature === index ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        activeFeature === index ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      {activeFeature === index && (
                        <ul className="space-y-2">
                          {feature.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-8 text-white">
                <div className="mb-6">
                  {(() => {
                    const IconComponent = features[activeFeature].icon;
                    return <IconComponent className="w-12 h-12 mb-4" />;
                  })()}
                  <h3 className="text-2xl font-bold mb-2">{features[activeFeature].title}</h3>
                  <p className="text-yellow-100">{features[activeFeature].description}</p>
                </div>
                <div className="bg-white/20 rounded-2xl p-6">
                  <h4 className="font-semibold mb-4">Key Features:</h4>
                  <ul className="space-y-2">
                    {features[activeFeature].details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How DuckSecure Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get professional smart contract audits in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Submit Your Contract",
                description: "Paste your contract address or upload Solidity code directly to our platform",
                icon: Code
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "ChainGPT AI performs comprehensive security analysis and vulnerability detection",
                icon: Zap
              },
              {
                step: "03",
                title: "Get Results",
                description: "Receive detailed audit report with findings, recommendations, and optimization tips",
                icon: Shield
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pay with DUCK tokens on DuckChain. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-yellow-300 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">One-Time Audit</h3>
                <p className="text-gray-600 mb-6">Perfect for single contract analysis</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">100 DUCK</div>
                <p className="text-gray-600">≈ $5.00 USD</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Single contract analysis",
                  "Comprehensive security report", 
                  "Gas optimization tips",
                  "AI-powered recommendations",
                  "48-hour access to results"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 px-6 border-2 border-yellow-400 text-yellow-600 font-semibold rounded-xl hover:bg-yellow-50 transition-all duration-300"
              >
                Start Single Audit
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute -top-4 -right-4 bg-white text-yellow-600 px-4 py-2 rounded-full font-semibold text-sm">
                Best Value
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Monthly Subscription</h3>
                <p className="text-yellow-100 mb-6">Unlimited audits for 30 days</p>
                <div className="text-4xl font-bold mb-2">500 DUCK</div>
                <p className="text-yellow-100">≈ $25.00 USD</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited contract audits",
                  "Priority AI analysis",
                  "Advanced optimization reports",
                  "24/7 AI assistant access", 
                  "Export audit reports",
                  "Email notifications"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-white mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onGetStarted}
                className="w-full py-3 px-6 bg-white text-yellow-600 font-semibold rounded-xl hover:bg-yellow-50 transition-all duration-300"
              >
                Start Subscription
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Developers Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what smart contract developers are saying about DuckSecure
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Secure Your Smart Contracts?
          </h2>
          <p className="text-xl text-yellow-100 mb-10">
            Join thousands of developers who trust DuckSecure for their smart contract security needs.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center px-8 py-4 bg-white text-yellow-600 font-semibold rounded-xl hover:bg-yellow-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DuckSecure</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered smart contract security for the DuckChain ecosystem.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 DuckSecure. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="https://scan.duckchain.io/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                DuckChain Explorer
              </a>
              <a href="https://docs.chaingpt.org/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                ChainGPT Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
