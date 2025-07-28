import React, { useState, useEffect } from 'react';
import { ChevronRight, Menu, X, Home, Users, Settings, BarChart3, Zap, ArrowRight, Star, Globe, Shield, Rocket } from 'lucide-react';
// CSS Styles embedded for complete functionality
const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}

/* Navigation Styles */
.navbar {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.5rem;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-brand:hover {
  transform: scale(1.05);
  color: #3b82f6;
}

.desktop-nav {
  display: flex;
  gap: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #6b7280;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: translateY(-2px);
}

.nav-item.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  color: #3b82f6;
  transform: scale(1.1);
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.98);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  background: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #6b7280;
  text-align: left;
}

.mobile-nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.mobile-nav-item.active {
  background: #3b82f6;
  color: white;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-content {
  animation: fadeIn 0.5s ease-out;
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 0;
  min-height: 60vh;
}

.hero-content {
  space-y: 2rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 2s infinite;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 1.5rem 0;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin: 1.5rem 0;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 3s ease-in-out infinite;
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  z-index: -1;
  opacity: 0.7;
  filter: blur(10px);
}

.card-content {
  display: flex;
  gap: 2rem;
}

.metric {
  text-align: center;
}

.metric-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.metric-label {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover:before {
  transform: scaleX(1);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.feature-arrow {
  display: flex;
  justify-content: flex-end;
  color: #3b82f6;
}

/* Stats Section */
.stats-section {
  padding: 4rem 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  margin: 2rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

/* Dashboard */
.dashboard-header {
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-weight: 600;
  color: #374151;
}

.trend-up {
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
}

.trend-down {
  color: #ef4444;
  font-weight: 600;
  font-size: 0.875rem;
}

.metric-large {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.metric-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Team */
.team-header {
  text-align: center;
  margin-bottom: 3rem;
}

.team-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.team-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.team-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.team-avatar {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.team-card h3 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.team-card p {
  color: #6b7280;
  margin-bottom: 1rem;
}

.team-rating {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
}

.team-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Settings */
.settings-header {
  margin-bottom: 3rem;
}

.settings-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.settings-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.settings-sections {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.settings-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.settings-card h3 {
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #374151;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-weight: 500;
  color: #374151;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.toggle-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toggle-btn:hover {
  transform: scale(1.05);
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Footer */
.footer {
  background: rgba(31, 41, 55, 0.95);
  color: white;
  padding: 3rem 2rem 1rem;
  backdrop-filter: blur(20px);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.footer-section {
  space-y: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links button {
  background: none;
  border: none;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-links button:hover {
  color: white;
}

.footer-bottom {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.slideInLeft { animation: slideInLeft 0.6s ease-out; }
.slideInRight { animation: slideInRight 0.6s ease-out; }
.fadeInUp { animation: fadeInUp 0.6s ease-out; }
.zoomIn { animation: zoomIn 0.6s ease-out; }
.bounceIn { animation: bounceIn 0.8s ease-out; }

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .mobile-menu-btn { display: block; }
  .mobile-nav { display: flex; }
  
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }
  
  .hero-title { font-size: 2.5rem; }
  .hero-buttons { justify-content: center; }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .team-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title { font-size: 2rem; }
  .hero-buttons { flex-direction: column; }
  .action-buttons { flex-direction: column; }
  .team-actions { flex-direction: column; }
  .settings-actions { flex-direction: column; }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const FlashFusionUnited = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  // Random animation effects
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

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const navigateTo = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    triggerRandomAnimation();
  };

  const HomePage = () => (
    <div className={`page-content ${animationClass}`}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap className="w-4 h-4" />
            <span>Powered by Innovation</span>
          </div>
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">FlashFusion-United</span>
          </h1>
          <p className="hero-subtitle">
            The next-generation platform that combines cutting-edge technology with seamless user experience. 
            Join thousands of users who trust FlashFusion-United for their digital transformation.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigateTo('dashboard')}
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigateTo('team')}
            >
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-glow"></div>
            <div className="card-content">
              <div className="metric">
                <span className="metric-number">99.9%</span>
                <span className="metric-label">Uptime</span>
              </div>
              <div className="metric">
                <span className="metric-number">50K+</span>
                <span className="metric-label">Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose FlashFusion-United?</h2>
          <p>Discover the features that make us stand out from the competition</p>
        </div>
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigateTo('dashboard')}>
            <div className="feature-icon">
              <Rocket className="w-6 h-6" />
            </div>
            <h3>Lightning Fast</h3>
            <p>Experience blazing-fast performance with our optimized infrastructure</p>
            <div className="feature-arrow">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="feature-card" onClick={() => navigateTo('team')}>
            <div className="feature-icon">
              <Shield className="w-6 h-6" />
            </div>
            <h3>Secure & Reliable</h3>
            <p>Bank-level security with 99.9% uptime guarantee</p>
            <div className="feature-arrow">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="feature-card" onClick={() => navigateTo('settings')}>
            <div className="feature-icon">
              <Globe className="w-6 h-6" />
            </div>
            <h3>Global Scale</h3>
            <p>Reach users worldwide with our global network infrastructure</p>
            <div className="feature-arrow">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">2.5M+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Countries</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </section>
    </div>
  );

  const DashboardPage = () => (
    <div className={`page-content ${animationClass}`}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Monitor your performance and analytics in real-time</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Active Sessions</h3>
            <span className="trend-up">+12%</span>
          </div>
          <div className="card-content">
            <div className="metric-large">2,847</div>
            <div className="metric-subtitle">Currently online</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Revenue</h3>
            <span className="trend-up">+8.2%</span>
          </div>
          <div className="card-content">
            <div className="metric-large">$12,943</div>
            <div className="metric-subtitle">This month</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Conversions</h3>
            <span className="trend-down">-2.1%</span>
          </div>
          <div className="card-content">
            <div className="metric-large">23.7%</div>
            <div className="metric-subtitle">Conversion rate</div>
          </div>
        </div>
        
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Growth</h3>
            <span className="trend-up">+15.3%</span>
          </div>
          <div className="card-content">
            <div className="metric-large">1,284</div>
            <div className="metric-subtitle">New users</div>
          </div>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={() => navigateTo('team')}>
          View Team <ArrowRight className="w-4 h-4 ml-2" />
        </button>
        <button className="btn btn-secondary" onClick={() => navigateTo('settings')}>
          Manage Settings
        </button>
      </div>
    </div>
  );

  const TeamPage = () => (
    <div className={`page-content ${animationClass}`}>
      <div className="team-header">
        <h1>Our Team</h1>
        <p>Meet the talented individuals behind FlashFusion-United</p>
      </div>
      
      <div className="team-grid">
        {[
          { name: 'Alex Johnson', role: 'CEO & Founder', avatar: '👨‍💼' },
          { name: 'Sarah Chen', role: 'CTO', avatar: '👩‍💻' },
          { name: 'Mike Rodriguez', role: 'Head of Design', avatar: '👨‍🎨' },
          { name: 'Emily Davis', role: 'Product Manager', avatar: '👩‍💼' },
          { name: 'David Kim', role: 'Lead Developer', avatar: '👨‍💻' },
          { name: 'Lisa Wang', role: 'Marketing Director', avatar: '👩‍📊' }
        ].map((member, index) => (
          <div key={index} className="team-card" onClick={triggerRandomAnimation}>
            <div className="team-avatar">{member.avatar}</div>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <div className="team-rating">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="team-actions">
        <button className="btn btn-primary" onClick={() => navigateTo('dashboard')}>
          View Dashboard <BarChart3 className="w-4 h-4 ml-2" />
        </button>
        <button className="btn btn-secondary" onClick={() => navigateTo('home')}>
          Back to Home
        </button>
      </div>
    </div>
  );

  const SettingsPage = () => (
    <div className={`page-content ${animationClass}`}>
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Customize your FlashFusion-United experience</p>
      </div>
      
      <div className="settings-sections">
        <div className="settings-card">
          <h3>Account Settings</h3>
          <div className="setting-item">
            <label>Email Notifications</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>ON</button>
          </div>
          <div className="setting-item">
            <label>Two-Factor Authentication</label>
            <button className="toggle-btn" onClick={triggerRandomAnimation}>OFF</button>
          </div>
          <div className="setting-item">
            <label>Auto-save</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>ON</button>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Appearance</h3>
          <div className="setting-item">
            <label>Dark Mode</label>
            <button className="toggle-btn" onClick={triggerRandomAnimation}>OFF</button>
          </div>
          <div className="setting-item">
            <label>Animations</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>ON</button>
          </div>
          <div className="setting-item">
            <label>Sound Effects</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>ON</button>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Privacy</h3>
          <div className="setting-item">
            <label>Data Analytics</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>ON</button>
          </div>
          <div className="setting-item">
            <label>Marketing Emails</label>
            <button className="toggle-btn" onClick={triggerRandomAnimation}>OFF</button>
          </div>
          <div className="setting-item">
            <label>Profile Visibility</label>
            <button className="toggle-btn active" onClick={triggerRandomAnimation}>PUBLIC</button>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="btn btn-primary" onClick={() => navigateTo('home')}>
          Save Changes <ArrowRight className="w-4 h-4 ml-2" />
        </button>
        <button className="btn btn-danger" onClick={triggerRandomAnimation}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home': return <HomePage />;
      case 'dashboard': return <DashboardPage />;
      case 'team': return <TeamPage />;
      case 'settings': return <SettingsPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => navigateTo('home')}>
            <Zap className="w-8 h-8 text-blue-500" />
            <span>FlashFusion-United</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="nav-menu desktop-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => navigateTo(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderCurrentPage()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <Zap className="w-6 h-6 text-blue-500" />
              <span>FlashFusion-United</span>
            </div>
            <p>Empowering the future through innovation and technology.</p>
          </div>
          <div className="footer-links">
            <button onClick={() => navigateTo('home')}>Home</button>
            <button onClick={() => navigateTo('dashboard')}>Dashboard</button>
            <button onClick={() => navigateTo('team')}>Team</button>
            <button onClick={() => navigateTo('settings')}>Settings</button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 FlashFusion-United. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FlashFusionUnited;