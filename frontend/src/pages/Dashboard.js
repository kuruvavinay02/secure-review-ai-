import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Shield, Eye, Zap, FileText } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [scanResult, setScanResult] = useState(location.state?.scanResult || null);
  const [loading, setLoading] = useState(!scanResult);
  
  useEffect(() => {
    if (!scanResult && scanId) {
      axios.get(`${API}/scan/${scanId}`)
        .then(response => {
          setScanResult(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to load scan:', error);
          setLoading(false);
        });
    }
  }, [scanId, scanResult]);
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading scan results...</p>
        </div>
      </div>
    );
  }
  
  if (!scanResult) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-300 mb-4">Scan not found</p>
          <button onClick={() => navigate('/scan')} className="btn-primary">
            Start New Scan
          </button>
        </div>
      </div>
    );
  }
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };
  
  return (
    <div className="min-h-screen pt-20">
      <div className="w-full px-4 md:px-6 py-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="dashboard-title">
            Security Dashboard
          </h1>
          <p className="text-slate-300">Scan ID: {scanResult.scan_id}</p>
        </div>
        
        {/* Deployment Readiness Banner */}
        <div className={`mb-6 p-6 rounded-xl border-2 ${
          scanResult.deployment_ready
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`} data-testid="deployment-readiness-banner">
          <div className="flex items-center gap-4">
            {scanResult.deployment_ready ? (
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontWeight: 900 }}>
                {scanResult.deployment_ready ? 'GO - Deployment Ready' : 'NO-GO - Deployment Blocked'}
              </h2>
              <p className="text-sm">
                {scanResult.deployment_ready
                  ? 'No critical issues found. System meets security requirements.'
                  : `${scanResult.critical_count} critical issues must be resolved before deployment.`}
              </p>
            </div>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-6" data-testid="metric-total-issues">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total Issues</span>
              <AlertTriangle className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold" style={{ fontWeight: 900 }}>{scanResult.total_issues}</div>
          </div>
          
          <div className="glass-card p-6" data-testid="metric-risk-score">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Risk Score</span>
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400" style={{ fontWeight: 900 }}>
              {Math.round(scanResult.risk_score)}
            </div>
          </div>
          
          <div className="glass-card p-6" data-testid="metric-security-posture">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Security Posture</span>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400" style={{ fontWeight: 900 }}>
              {Math.max(0, 100 - Math.round(scanResult.risk_score))}%
            </div>
          </div>
          
          <div className="glass-card p-6" data-testid="metric-critical-issues">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Critical Issues</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400" style={{ fontWeight: 900 }}>
              {scanResult.critical_count}
            </div>
          </div>
        </div>
        
        {/* Severity Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4" style={{ fontWeight: 900 }} data-testid="severity-distribution-title">
              Severity Distribution
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Critical', count: scanResult.critical_count, color: 'bg-red-500' },
                { label: 'High', count: scanResult.high_count, color: 'bg-orange-500' },
                { label: 'Medium', count: scanResult.medium_count, color: 'bg-yellow-500' },
                { label: 'Low', count: scanResult.low_count, color: 'bg-blue-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3" data-testid={`severity-${item.label.toLowerCase()}`}>
                  <div className="w-24 text-sm text-slate-300">{item.label}</div>
                  <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${(item.count / scanResult.total_issues) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right font-bold">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4" style={{ fontWeight: 900 }}>Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/attack-sim/${scanResult.scan_id}`)}
                data-testid="view-attack-simulation-btn"
                className="w-full btn-secondary flex items-center gap-2 justify-start"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                View Attack Simulation
              </button>
              <button
                onClick={() => navigate(`/compliance/${scanResult.scan_id}`)}
                data-testid="view-compliance-report-btn"
                className="w-full btn-secondary flex items-center gap-2 justify-start"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                View Compliance Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Vulnerabilities List */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontWeight: 900 }} data-testid="vulnerabilities-list-title">
            Detected Vulnerabilities ({scanResult.vulnerabilities?.length || 0})
          </h3>
          
          <div className="space-y-3">
            {scanResult.vulnerabilities?.map((vuln, index) => (
              <div
                key={vuln.id || index}
                data-testid={`vulnerability-item-${index}`}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-all cursor-pointer"
                onClick={() => navigate(`/issue/${vuln.id}`, { state: { vulnerability: vuln, scanId: scanResult.scan_id } })}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                      <h4 className="font-bold">{vuln.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{vuln.ai_explanation?.substring(0, 150)}...</p>
                    {vuln.line_number && (
                      <p className="text-xs text-slate-500">Line {vuln.line_number}</p>
                    )}
                  </div>
                  <button
                    data-testid={`view-details-btn-${index}`}
                    className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}