import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code, CheckCircle, Shield } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SecureFix() {
  const { vulnId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const vulnerability = location.state?.vulnerability;
  const [fix, setFix] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    axios.get(`${API}/secure-fix/${vulnId}`)
      .then(response => {
        setFix(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load fix:', error);
        setLoading(false);
      });
  }, [vulnId]);
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating secure fix...</p>
        </div>
      </div>
    );
  }
  
  if (!fix) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300 mb-4">Fix not available</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          data-testid="back-btn"
          className="btn-secondary flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="secure-fix-title">
            AI-Generated Secure Fix
          </h1>
          <p className="text-slate-300">Automated remediation with security best practices</p>
        </div>
        
        {/* Before & After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Original Code */}
          <div className="glass-card p-6" data-testid="original-code-card">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-bold" style={{ fontWeight: 900 }}>Vulnerable Code</h2>
            </div>
            <pre className="bg-[#0b101b] border border-red-500/30 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-slate-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {fix.original_code}
              </code>
            </pre>
          </div>
          
          {/* Fixed Code */}
          <div className="glass-card p-6" data-testid="fixed-code-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold" style={{ fontWeight: 900 }}>Secure Code</h2>
            </div>
            <pre className="bg-[#0b101b] border border-emerald-500/30 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-slate-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {fix.fixed_code}
              </code>
            </pre>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="glass-card p-6 mb-6" data-testid="explanation-card">
          <h2 className="text-xl font-bold mb-4" style={{ fontWeight: 900 }}>Why This Fix Works</h2>
          <p className="text-slate-200 leading-relaxed">{fix.explanation}</p>
        </div>
        
        {/* Prevents Attacks */}
        <div className="glass-card p-6" data-testid="prevents-attacks-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Prevents These Attacks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fix.prevents_attacks.map((attack, index) => (
              <div
                key={index}
                data-testid={`prevention-${index}`}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-emerald-400">{attack}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            data-testid="apply-fix-btn"
            className="btn-primary"
            onClick={() => {
              // In a real app, this would apply the fix
              alert('Fix applied successfully! (Demo mode)');
            }}
          >
            Apply Fix (Demo)
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            View More Issues
          </button>
        </div>
      </div>
    </div>
  );
}