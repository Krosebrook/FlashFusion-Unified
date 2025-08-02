import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Code, Database, Rocket, Shield, BarChart3,
  Settings, User, Plus, Play, Pause, Save, Download, Upload,
  Terminal, Eye, GitBranch, Layers, Cloud, Smartphone, Monitor,
  Globe, Zap, Lock, CheckCircle, AlertTriangle, Clock, Users,
  FileText, Search, Filter, Maximize2, Minimize2, RefreshCw,
  Send, Mic, Image, Paperclip, Bot, Brain, Cpu, Activity,
  Star, Folder, Package, TestTube, Target, Workflow, PieChart,
  TrendingUp, DollarSign, Bell, Palette, Layout, Component,
  Cog, HelpCircle, ExternalLink, Copy, Share2, X
} from 'lucide-react';

const UniversalAppGenerator = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      agent: 'Master Orchestrator',
      content: 'Welcome to the Universal AI App Generator! I can create any type of application across web, mobile, desktop, and edge platforms. What would you like to build today?',
      timestamp: new Date().toISOString(),
      status: 'delivered'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('orchestrator');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeProject, setActiveProject] = useState('social-media-app');
  const scrollRef = useRef(null);

  // Enhanced project statistics with real-time updates
  const [projectStats, setProjectStats] = useState({
    totalProjects: 127,
    activeDeployments: 43,
    securityScore: 98.5,
    uptime: '99.97%',
    monthlyActiveUsers: '2.4M',
    costOptimizationSaved: '$12,847',
    codeQualityScore: 9.2,
    testCoverage: 94
  });

  // Comprehensive agent system with specialized capabilities
  const agents = [
    {
      id: 'orchestrator',
      name: 'Master Orchestrator',
      icon: Brain,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      status: 'active',
      description: 'Coordinates all agents and manages project lifecycle',
      capabilities: ['Project Planning', 'Agent Coordination', 'Risk Assessment', 'Quality Control']
    },
    {
      id: 'codegen',
      name: 'Code Generation Agent',
      icon: Code,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      status: 'active',
      description: 'Generates production-ready code across all platforms',
      capabilities: ['Full-Stack Development', 'Multi-Language Support', 'Framework Integration', 'API Development']
    },
    {
      id: 'security',
      name: 'Security Guardian',
      icon: Shield,
      color: 'bg-gradient-to-r from-red-500 to-rose-500',
      status: 'active',
      description: 'Ensures enterprise-grade security across all applications',
      capabilities: ['OWASP Compliance', 'Penetration Testing', 'Compliance Auditing', 'Threat Detection']
    },
    {
      id: 'deploy',
      name: 'Deployment Specialist',
      icon: Rocket,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      status: 'active',
      description: 'Handles multi-platform deployment and infrastructure',
      capabilities: ['CI/CD Pipelines', 'Cloud Integration', 'Auto-Scaling', 'Performance Optimization']
    },
    {
      id: 'database',
      name: 'Data Architect',
      icon: Database,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      status: 'active',
      description: 'Designs and optimizes database architecture',
      capabilities: ['Schema Design', 'Query Optimization', 'Data Migration', 'Real-time Sync']
    },
    {
      id: 'qa',
      name: 'Quality Engineer',
      icon: TestTube,
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      status: 'active',
      description: 'Ensures code quality and comprehensive testing',
      capabilities: ['Automated Testing', 'Performance Testing', 'A11y Testing', 'Visual Regression']
    },
    {
      id: 'ux',
      name: 'UX Optimizer',
      icon: Palette,
      color: 'bg-gradient-to-r from-pink-500 to-purple-500',
      status: 'active',
      description: 'Optimizes user experience and interface design',
      capabilities: ['Design Systems', 'User Research', 'A/B Testing', 'Accessibility']
    },
    {
      id: 'cost',
      name: 'Cost Intelligence',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      status: 'active',
      description: 'Monitors and optimizes resource costs in real-time',
      capabilities: ['Cost Analysis', 'Resource Optimization', 'Budget Alerts', 'ROI Tracking']
    }
  ];

  // Enhanced platform support with detailed capabilities
  const platforms = [
    {
      id: 'web',
      name: 'Web Applications',
      icon: Globe,
      tech: 'React, Vue, Angular, Next.js',
      status: 'ready',
      deployment: ['Vercel', 'Netlify', 'AWS', 'Azure'],
      features: ['PWA Support', 'SSR/SSG', 'Edge Computing', 'Real-time Features']
    },
    {
      id: 'mobile',
      name: 'Mobile Applications',
      icon: Smartphone,
      tech: 'React Native, Flutter, Ionic',
      status: 'ready',
      deployment: ['App Store', 'Google Play', 'TestFlight', 'Firebase'],
      features: ['Native APIs', 'Push Notifications', 'Offline Sync', 'Deep Linking']
    },
    {
      id: 'desktop',
      name: 'Desktop Applications',
      icon: Monitor,
      tech: 'Electron, Tauri, .NET MAUI',
      status: 'ready',
      deployment: ['Windows Store', 'Mac App Store', 'Linux Repos', 'Direct Download'],
      features: ['Auto-Updates', 'System Integration', 'Native Performance', 'Cross-Platform']
    },
    {
      id: 'edge',
      name: 'Edge Functions',
      icon: Zap,
      tech: 'Cloudflare Workers, Vercel Edge',
      status: 'ready',
      deployment: ['Cloudflare', 'Vercel', 'AWS Lambda@Edge', 'Fastly'],
      features: ['Global Distribution', 'Sub-50ms Latency', 'Auto-Scaling', 'Pay-per-Request']
    }
  ];

  // Comprehensive security monitoring
  const securityChecks = [
    { name: 'OWASP Top 10', status: 'passed', score: 100, lastCheck: '2 min ago' },
    { name: 'Dependency Vulnerabilities', status: 'passed', score: 98, lastCheck: '5 min ago' },
    { name: 'Code Quality Analysis', status: 'passed', score: 95, lastCheck: '1 min ago' },
    { name: 'Access Control Audit', status: 'passed', score: 100, lastCheck: '10 min ago' },
    { name: 'Data Encryption Check', status: 'passed', score: 100, lastCheck: '3 min ago' },
    { name: 'API Security Scan', status: 'warning', score: 92, lastCheck: '1 min ago' },
    { name: 'Compliance Standards', status: 'passed', score: 97, lastCheck: '15 min ago' },
    { name: 'Penetration Test', status: 'passed', score: 96, lastCheck: '1 hour ago' }
  ];

  // Enhanced deployment targets with cost tracking
  const deploymentTargets = [
    {
      name: 'Vercel Production',
      status: 'deployed',
      url: 'social-app.vercel.app',
      cost: '$12/mo',
      users: '24.5K',
      uptime: '99.9%',
      lastDeploy: '2 hours ago'
    },
    {
      name: 'iOS App Store',
      status: 'review',
      url: 'pending review',
      cost: '$99/year',
      users: 'pending',
      uptime: 'N/A',
      lastDeploy: '1 day ago'
    },
    {
      name: 'Android Play Store',
      status: 'deployed',
      url: 'play.google.com/store/apps',
      cost: '$25/year',
      users: '15.2K',
      uptime: '99.8%',
      lastDeploy: '3 days ago'
    },
    {
      name: 'AWS Production',
      status: 'configuring',
      url: 'pending',
      cost: '$45/mo',
      users: 'pending',
      uptime: 'N/A',
      lastDeploy: 'never'
    }
  ];

  // Real-time project metrics
  const projectMetrics = [
    { name: 'Response Time', value: '127ms', trend: 'down', good: true },
    { name: 'Error Rate', value: '0.02%', trend: 'down', good: true },
    { name: 'Throughput', value: '2.4K req/min', trend: 'up', good: true },
    { name: 'Database Queries', value: '156ms avg', trend: 'down', good: true },
    { name: 'Memory Usage', value: '68%', trend: 'stable', good: true },
    { name: 'CPU Utilization', value: '23%', trend: 'down', good: true }
  ];

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isGenerating) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate realistic AI agent coordination with progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    setTimeout(() => {
      const agentResponses = [
        {
          agent: 'Master Orchestrator',
          content: "Perfect! I'm coordinating with our specialized agents to create your social media platform. Here's our execution plan:\n\n✅ **Code Generation Agent**: Building React Native frontend + Node.js backend\n✅ **Security Guardian**: Implementing OAuth 2.0 + JWT authentication\n✅ **Data Architect**: Designing PostgreSQL schema with Redis caching\n✅ **Quality Engineer**: Setting up Jest + Cypress testing suite\n✅ **Deployment Specialist**: Configuring AWS ECS with auto-scaling\n\nEstimated completion: 4 minutes",
          progress: 15
        },
        {
          agent: 'Code Generation Agent',
          content: "🚀 **Frontend Generated**: React Native app with 12 screens including:\n• User authentication & profiles\n• Real-time chat with Socket.io\n• Photo/video sharing with filters\n• Push notifications\n• Dark mode support\n\n🔧 **Backend Created**: Node.js API with:\n• RESTful endpoints + GraphQL\n• Real-time messaging\n• File upload handling\n• Rate limiting & caching\n\n📱 **Mobile Features**: Camera integration, geolocation, offline sync",
          progress: 45
        },
        {
          agent: 'Security Guardian',
          content: "🛡️ **Security Implementation Complete**:\n\n✅ Multi-factor authentication (TOTP + SMS)\n✅ Input sanitization & SQL injection protection\n✅ XSS prevention with CSP headers\n✅ API rate limiting (100 req/min per user)\n✅ End-to-end encryption for messages\n✅ GDPR compliance with data deletion\n✅ Vulnerability scanning integrated\n\n**Security Score: 98.5%** (Industry leading)",
          progress: 70
        },
        {
          agent: 'Deployment Specialist',
          content: "🚀 **Deployment Pipeline Ready**:\n\n✅ **Web**: Deployed to Vercel with CDN\n✅ **Mobile**: Built for iOS/Android app stores\n✅ **Backend**: AWS ECS with auto-scaling\n✅ **Database**: RDS PostgreSQL with read replicas\n✅ **Monitoring**: CloudWatch + Sentry error tracking\n\n🌍 **Global Distribution**: 5 regions, <100ms latency\n💰 **Cost Optimized**: $47/month for 10K users\n\n**Live URLs:**\n• Web: https://your-social-app.vercel.app\n• API: https://api.your-social-app.com\n• Admin: https://admin.your-social-app.com",
          progress: 100
        }
      ];

      agentResponses.forEach((response, index) => {
        setTimeout(() => {
          const agentMessage = {
            id: Date.now() + index,
            type: 'assistant',
            agent: response.agent,
            content: response.content,
            timestamp: new Date().toISOString(),
            status: 'delivered',
            progress: response.progress
          };
          setChatMessages(prev => [...prev, agentMessage]);

          if (index === agentResponses.length - 1) {
            setIsGenerating(false);
            clearInterval(progressInterval);
            setGenerationProgress(100);
          }
        }, index * 2000);
      });
    }, 1000);
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const NavigationSidebar = () => (
    <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white h-full flex flex-col shadow-2xl">
      <div className="p-6 border-b border-gray-700/50">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Universal AI Generator
          </span>
        </h1>
        <div className="text-xs text-gray-400 mt-1">Enterprise Edition v2.1</div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {[
          { id: 'chat', name: 'AI Command Center', icon: MessageCircle, badge: '4' },
          { id: 'editor', name: 'Code Studio', icon: Code, badge: null },
          { id: 'database', name: 'Data Architect', icon: Database, badge: null },
          { id: 'deploy', name: 'Global Deploy', icon: Rocket, badge: '3' },
          { id: 'security', name: 'Security Shield', icon: Shield, badge: null },
          { id: 'analytics', name: 'Intelligence Hub', icon: BarChart3, badge: null },
          { id: 'testing', name: 'Quality Labs', icon: TestTube, badge: '12' },
          { id: 'projects', name: 'Project Galaxy', icon: Layers, badge: null },
          { id: 'settings', name: 'Command Center', icon: Settings, badge: null }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-purple-400'}`} />
              <span className="font-medium">{item.name}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700/50">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Sarah Chen</div>
              <div className="text-xs text-purple-300">Enterprise Developer</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-purple-300 font-bold">{projectStats.totalProjects}</div>
              <div className="text-gray-400">Projects</div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 text-center">
              <div className="text-green-300 font-bold">{projectStats.securityScore}%</div>
              <div className="text-gray-400">Security</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatInterface = () => (
    <div className="flex h-full">
      {/* Enhanced Agent Selection Panel */}
      <div className="w-96 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600" />
            AI Agent Fleet
          </h3>
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            All Systems Active
          </div>
        </div>

        <div className="space-y-3">
          {agents.map(agent => (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                selectedAgent === agent.id
                  ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${agent.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <agent.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{agent.name}</h4>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{agent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 2).map(cap => (
                      <span key={cap} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {cap}
                      </span>
                    ))}
                    {agent.capabilities.length > 2 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{agent.capabilities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Quick Actions
          </h4>
          <div className="space-y-2">
            {[
              { icon: '🌐', text: 'Generate Web App', gradient: 'from-blue-500 to-cyan-500' },
              { icon: '📱', text: 'Build Mobile App', gradient: 'from-green-500 to-emerald-500' },
              { icon: '🖥️', text: 'Create Desktop App', gradient: 'from-purple-500 to-pink-500' },
              { icon: '⚡', text: 'Deploy Edge Functions', gradient: 'from-orange-500 to-red-500' }
            ].map(action => (
              <button
                key={action.text}
                className={`w-full p-3 bg-gradient-to-r ${action.gradient} hover:shadow-lg rounded-lg text-white text-sm font-medium transition-all duration-200 transform hover:scale-[1.02]`}
              >
                <span className="mr-2">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Chat Messages Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">AI Command Center</h2>
                <div className="text-sm text-gray-500">
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Agents coordinating... ({Math.round(generationProgress)}%)
                    </span>
                  ) : (
                    'Ready for your next command'
                  )}
                </div>
              </div>
            </div>

            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm">
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
          {chatMessages.map(message => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-4xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.agent && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{message.agent}</span>
                    <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}

                <div className={`p-4 rounded-2xl shadow-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => {
                      if (line.includes('✅') || line.includes('🚀') || line.includes('🛡️') || line.includes('🌍') || line.includes('💰')) {
                        return (
                          <div key={index} className={`${index > 0 ? 'mt-2' : ''} ${message.type === 'assistant' ? 'text-gray-800' : 'text-white'}`}>
                            {line}
                          </div>
                        );
                      }
                      return line && (
                        <p key={index} className={`${index > 0 ? 'mt-1' : ''} ${message.type === 'assistant' ? 'text-gray-700' : 'text-white'}`}>
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {message.progress && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${message.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{message.progress}%</span>
                    </div>
                  )}
                </div>

                {message.type === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2">
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI agents are coordinating your request...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Message Input */}
        <div className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  placeholder="Describe your app idea... (e.g., 'Create a full-stack e-commerce platform with AI recommendations')"
                  className="w-full p-4 pr-16 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[60px] max-h-32"
                  rows="2"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>💡 Try: "Build a social media app with AI moderation"</span>
                </div>
                <div>{currentMessage.length}/2000</div>
              </div>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isGenerating}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat': return <ChatInterface />;
      case 'security': return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Security Command Center</h2>
              <p className="text-gray-600 mt-2">Enterprise-grade security monitoring and compliance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{projectStats.securityScore}%</div>
                <div className="text-sm text-gray-500">Security Score</div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-medium shadow-lg">
                Run Full Security Scan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            {securityChecks.map(check => (
              <div key={check.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{check.name}</h3>
                  {check.status === 'passed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-2 text-gray-900">{check.score}%</div>
                <div className={`text-sm mb-2 ${
                  check.status === 'passed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {check.status === 'passed' ? 'All checks passed' : 'Review required'}
                </div>
                <div className="text-xs text-gray-500">Last check: {check.lastCheck}</div>
              </div>
            ))}
          </div>
        </div>
      );
      case 'deploy': return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Global Deployment Center</h2>
              <p className="text-gray-600 mt-2">Multi-platform deployment with intelligent optimization</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium shadow-lg flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Deploy to All Platforms
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            {platforms.map(platform => (
              <div key={platform.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{platform.name}</h3>
                      <div className="text-sm text-gray-600">{platform.tech}</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {platform.status}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Deployment Targets</div>
                    <div className="flex flex-wrap gap-1">
                      {platform.deployment.map(target => (
                        <span key={target} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Platform Features</div>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.map(feature => (
                        <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all">
                  Configure Deployment
                </button>
              </div>
            ))}
          </div>
        </div>
      );
      case 'analytics': return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Intelligence Hub</h2>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {Object.entries(projectStats).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      default: return (
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Settings className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600">
                This feature is being developed by our AI agents.
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <NavigationSidebar />
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UniversalAppGenerator;