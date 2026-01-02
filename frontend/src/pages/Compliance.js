import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Compliance() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owasp');
  
  useEffect(() => {
    axios.get(`${API}/compliance/${scanId}`)
      .then(response => {
        setCompliance(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load compliance:', error);
        setLoading(false);
      });
  }, [scanId]);
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading compliance data...</p>
        </div>
      </div>
    );
  }
  
  if (!compliance) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 mb-4">Compliance data not available</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warn': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };
  
  const tabs = [
    { id: 'owasp', label: 'OWASP Top 10' },
    { id: 'iso27001', label: 'ISO 27001' },
    { id: 'nist', label: 'NIST CSF' },
    { id: 'gdpr', label: 'GDPR' }
  ];
  
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          data-testid="back-btn"
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="compliance-title">
              Compliance & Standards
            </h1>
            <p className="text-slate-300">Global security framework alignment</p>
          </div>
          <button
            data-testid="generate-report-btn"
            className="btn-primary flex items-center gap-2"
            onClick={() => alert('PDF report generated! (Demo mode)')}
          >
            <Download className="w-5 h-5" />
            Generate PDF Report
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10" data-testid="compliance-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* OWASP Tab */}
        {activeTab === 'owasp' && (
          <div data-testid="owasp-content">
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ fontWeight: 900 }}>OWASP Top 10 Coverage</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400" style={{ fontWeight: 900 }}>
                    {compliance.owasp.compliance_score}%
                  </div>
                  <div className="text-sm text-slate-400">Compliance Score</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(compliance.owasp.mapping).map(([key, value]) => (
                  <div
                    key={key}
                    data-testid={`owasp-${key}`}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(value.status)}
                      <div>
                        <div className="font-medium">{key.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-slate-400">{value.issues} issue(s)</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      value.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400' :
                      value.status === 'warn' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {value.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* ISO 27001 Tab */}
        {activeTab === 'iso27001' && (
          <div data-testid="iso27001-content">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ fontWeight: 900 }}>ISO 27001 Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-4xl font-bold text-blue-400 mb-2" style={{ fontWeight: 900 }}>
                    {compliance.iso27001.score}%
                  </div>
                  <div className="text-slate-300">Compliance Score</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-4xl font-bold text-emerald-400 mb-2" style={{ fontWeight: 900 }}>
                    {compliance.iso27001.controls_passed}/{compliance.iso27001.controls_total}
                  </div>
                  <div className="text-slate-300">Controls Passed</div>
                </div>
              </div>
              <div className="mt-6">
                <div className={`px-4 py-3 rounded-lg border ${
                  compliance.iso27001.status === 'compliant'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {compliance.iso27001.status === 'compliant' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-bold">Status: {compliance.iso27001.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* NIST Tab */}
        {activeTab === 'nist' && (
          <div data-testid="nist-content">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ fontWeight: 900 }}>NIST Cybersecurity Framework</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-4xl font-bold text-blue-400 mb-2" style={{ fontWeight: 900 }}>
                    {compliance.nist.score}%
                  </div>
                  <div className="text-slate-300">Framework Score</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-2xl font-bold text-emerald-400 mb-2" style={{ fontWeight: 900 }}>
                    {compliance.nist.categories_met}/5
                  </div>
                  <div className="text-slate-300">Categories Met</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className={`inline-block px-3 py-1 rounded-lg font-bold ${
                    compliance.nist.status === 'compliant'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {compliance.nist.status.toUpperCase()}
                  </div>
                  <div className="text-slate-300 mt-2 text-sm">{compliance.nist.framework}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* GDPR Tab */}
        {activeTab === 'gdpr' && (
          <div data-testid="gdpr-content">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ fontWeight: 900 }}>GDPR Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {compliance.gdpr.compliant ? (
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400" />
                    )}
                    <div>
                      <div className="text-xl font-bold" style={{ fontWeight: 900 }}>
                        {compliance.gdpr.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                      </div>
                      <div className="text-sm text-slate-400">Overall Status</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <div className="text-xl font-bold mb-1" style={{ fontWeight: 900 }}>
                    {compliance.gdpr.risk_level.toUpperCase()}
                  </div>
                  <div className="text-sm text-slate-400">Risk Level</div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">Data Protection</span>
                  <span className="font-bold text-emerald-400">{compliance.gdpr.data_protection}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">Breach Notification Required</span>
                  <span className={`font-bold ${
                    compliance.gdpr.breach_notification_required ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {compliance.gdpr.breach_notification_required ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}