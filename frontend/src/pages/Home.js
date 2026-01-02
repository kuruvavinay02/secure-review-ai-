import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Zap, Globe, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [demoMode] = useState(true);
  
  const pillars = [
    {
      icon: Brain,
      title: 'AI Reasoning',
      description: 'Context-aware vulnerability analysis that understands business logic, not just patterns.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Zap,
      title: 'Attack Simulation',
      description: 'Visual kill-chain showing real-world attack scenarios and citizen impact.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: CheckCircle,
      title: 'Secure Fixes',
      description: 'AI-generated remediation code with explanations of why it prevents future attacks.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Globe,
      title: 'Global Compliance',
      description: 'Automated mapping to OWASP, ISO 27001, NIST CSF, and GDPR standards.',
      color: 'from-orange-500 to-orange-600'
    }
  ];
  
  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ fontWeight: 900 }}
                data-testid="hero-headline"
              >
                AI-Powered Secure Code Review, Attack Simulation & Compliance Intelligence
              </h1>
              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl">
                Protect governments, enterprises, and users from software vulnerabilities — before deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/scan')}
                  data-testid="start-secure-scan-btn"
                  className="btn-primary flex items-center gap-2 justify-center"
                >
                  Start Secure Scan
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/education')}
                  data-testid="learn-more-btn"
                  className="btn-secondary"
                >
                  Learn More
                </button>
              </div>
              
              {demoMode && (
                <div className="mt-6 inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm" data-testid="demo-mode-badge">
                  Demo Mode Active - Try Sample Vulnerable Code
                </div>
              )}
            </div>
            
            <div className="md:col-span-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
                <img 
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg" 
                  alt="Cybersecurity Network" 
                  className="relative rounded-2xl shadow-2xl border border-white/10"
                  style={{ opacity: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 4 Pillars Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontWeight: 900 }} data-testid="pillars-heading">
          Why AI Changes Everything
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                data-testid={`pillar-card-${index}`}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontWeight: 900 }}>{pillar.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 text-center" data-testid="stat-vulnerabilities">
            <div className="text-4xl font-bold text-blue-400 mb-2" style={{ fontWeight: 900 }}>80%</div>
            <p className="text-slate-300">Reduction in critical vulnerabilities after fixes</p>
          </div>
          <div className="glass-card p-8 text-center" data-testid="stat-review-cycles">
            <div className="text-4xl font-bold text-emerald-400 mb-2" style={{ fontWeight: 900 }}>65%</div>
            <p className="text-slate-300">Faster review cycles with AI assistance</p>
          </div>
          <div className="glass-card p-8 text-center" data-testid="stat-compliance">
            <div className="text-4xl font-bold text-purple-400 mb-2" style={{ fontWeight: 900 }}>52% → 92%</div>
            <p className="text-slate-300">Compliance score improvement</p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="glass-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontWeight: 900 }}>Ready to Secure Your Code?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join government agencies and enterprises using AI-powered security analysis to protect millions of users.
          </p>
          <button
            onClick={() => navigate('/scan')}
            data-testid="cta-start-scan-btn"
            className="btn-primary"
          >
            Start Your First Scan
          </button>
        </div>
      </div>
    </div>
  );
}