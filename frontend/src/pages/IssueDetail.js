import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Brain, Shield, Code } from 'lucide-react';

export default function IssueDetail() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const vulnerability = location.state?.vulnerability;
  const scanId = location.state?.scanId;
  
  if (!vulnerability) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-300 mb-4">Issue not found</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
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
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          data-testid="back-btn"
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getSeverityColor(vulnerability.severity)}`} data-testid="severity-badge">
              {vulnerability.severity}
            </span>
            <h1 className="text-3xl font-bold" style={{ fontWeight: 900 }} data-testid="issue-title">
              {vulnerability.title}
            </h1>
          </div>
          <p className="text-slate-400">{vulnerability.type}</p>
        </div>
        
        {/* AI Explanation */}
        <div className="glass-card p-6 mb-6" data-testid="ai-explanation-card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>AI Analysis</h2>
          </div>
          <p className="text-slate-200 leading-relaxed mb-4">{vulnerability.ai_explanation}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Confidence Score:</span>
              <span className="text-emerald-400 font-bold">{Math.round(vulnerability.confidence_score * 100)}%</span>
            </div>
          </div>
        </div>
        
        {/* Code Snippet */}
        {vulnerability.code_snippet && (
          <div className="glass-card p-6 mb-6" data-testid="code-snippet-card">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Affected Code</h2>
            </div>
            {vulnerability.line_number && (
              <p className="text-sm text-slate-400 mb-2">Line {vulnerability.line_number}</p>
            )}
            <pre className="bg-[#0b101b] border border-white/10 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-slate-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {vulnerability.code_snippet}
              </code>
            </pre>
          </div>
        )}
        
        {/* Policy Mapping */}
        <div className="glass-card p-6 mb-6" data-testid="policy-mapping-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Compliance & Policy Mapping</h2>
          </div>
          <div className="space-y-2">
            {vulnerability.policy_mappings?.map((policy, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-slate-200">{policy}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recommendation */}
        <div className="glass-card p-6 mb-6" data-testid="recommendation-card">
          <h2 className="text-xl font-bold mb-4" style={{ fontWeight: 900 }}>Remediation Steps</h2>
          <p className="text-slate-200 leading-relaxed">{vulnerability.recommendation}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/secure-fix/${vulnerability.id}`, { state: { vulnerability } })}
            data-testid="view-ai-fix-btn"
            className="btn-primary flex items-center gap-2"
          >
            <Brain className="w-5 h-5" />
            View AI-Generated Fix
          </button>
          {scanId && (
            <button
              onClick={() => navigate(`/attack-sim/${scanId}`)}
              data-testid="view-attack-scenario-btn"
              className="btn-secondary"
            >
              View Attack Scenario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}