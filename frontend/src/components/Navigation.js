import { Link, useLocation } from 'react-router-dom';
import { Shield, Search, BarChart3, AlertTriangle, Wrench, FileText, GraduationCap, Settings as SettingsIcon } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Shield },
    { path: '/scan', label: 'Secure Scan', icon: Search },
    { path: '/education', label: 'Training', icon: GraduationCap },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center glow-blue">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontWeight: 900 }}>SecureReview AI+++</span>
          </Link>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}