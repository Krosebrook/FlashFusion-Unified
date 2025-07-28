import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, ArrowRight, Star, Globe, Shield, Rocket, Zap, Bot, Target, Users, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  const [, setLocation] = useLocation();
  const [animationClass, setAnimationClass] = useState('');

  // Animation effects
  const animations = ['slideInLeft', 'slideInRight', 'fadeInUp', 'zoomIn', 'bounceIn'];
  
  const triggerRandomAnimation = () => {
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    setAnimationClass(randomAnimation);
    setTimeout(() => setAnimationClass(''), 1000);
  };

  // Trigger random animations at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        triggerRandomAnimation();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navigateToApp = () => {
    setLocation('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <header className="relative z-50">
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">FlashFusion</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
                <a href="#stats" className="text-white/80 hover:text-white transition-colors">About</a>
                <button 
                  onClick={navigateToApp}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Launch App
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 ${animationClass}`}>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-white/90 text-sm font-medium">AI-Powered Business Innovation</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Transform Ideas Into 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Reality</span>
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed">
                FlashFusion accelerates your business journey with specialized AI agents that create brand kits, 
                content strategies, SEO-optimized landing pages, and product mockups in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={navigateToApp}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl" />
                <div className="relative grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">50K+</div>
                    <div className="text-white/70">Ideas Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">99.9%</div>
                    <div className="text-white/70">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">5 Min</div>
                    <div className="text-white/70">Avg Creation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-white/70">AI Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              AI Agents That Work For You
            </h2>
            <p className="text-xl text-white/70">
              Specialized AI agents handle every aspect of your business launch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Brand Kit Agent</h3>
              <p className="text-white/70">Generate complete brand guidelines, logos, and visual identity packages</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Content Kit Agent</h3>
              <p className="text-white/70">Create marketing copy, social media content, and content strategies</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">SEO Site Generator</h3>
              <p className="text-white/70">Build landing pages optimized for search engines and conversions</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Product Mockup Agent</h3>
              <p className="text-white/70">Design product visualizations and professional mockups instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-white/70">
              Join entrepreneurs worldwide who've launched successful businesses
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-white/70 font-medium">Businesses Launched</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-white/70 font-medium">Ideas Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-white/70 font-medium">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-white/70 font-medium">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Launch Your Next Big Idea?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of entrepreneurs who've transformed their ideas into successful businesses
          </p>
          <button 
            onClick={navigateToApp}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5 inline" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FlashFusion</span>
            </div>
            
            <div className="flex space-x-8 text-white/70">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#stats" className="hover:text-white transition-colors">About</a>
              <button onClick={navigateToApp} className="hover:text-white transition-colors">
                Launch App
              </button>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50">
            <p>&copy; 2025 FlashFusion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;