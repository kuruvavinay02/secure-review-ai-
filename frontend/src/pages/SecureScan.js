import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Code, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SecureScan() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [projectContext, setProjectContext] = useState('Enterprise');
  const [scanProfile, setScanProfile] = useState('Fast');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  
  const loadDemoCode = async () => {
    try {
      const response = await axios.get(`${API}/demo/sample-code`);
      const samples = response.data;
      setCode(samples[language] || samples.python);
      setDetectedLanguage(language);
      toast.success('Demo code loaded successfully');
    } catch (error) {
      toast.error('Failed to load demo code');
    }
  };
  
  const detectLanguageFromCode = (codeText) => {
    if (codeText.includes('import flask') || codeText.includes('def ') || codeText.includes('import ')) {
      return 'python';
    } else if (codeText.includes('const ') || codeText.includes('function') || codeText.includes('require(')) {
      return 'javascript';
    } else if (codeText.includes('public class') || codeText.includes('import java')) {
      return 'java';
    }
    return language;
  };
  
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (newCode.length > 50) {
      const detected = detectLanguageFromCode(newCode);
      setDetectedLanguage(detected);
    }
  };
  
  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter or upload code to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const response = await axios.post(`${API}/scan/analyze`, {
        code,
        language: detectedLanguage || language,
        project_context: projectContext,
        scan_profile: scanProfile
      });
      
      const result = response.data;
      toast.success(`Scan complete! Found ${result.total_issues} issues`);
      
      // Navigate to dashboard with scan results
      setTimeout(() => {
        navigate(`/dashboard/${result.scan_id}`, { state: { scanResult: result } });
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="scan-page-title">
            Secure Code Scanner
          </h1>
          <p className="text-slate-300">Upload your code for AI-powered security analysis</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ fontWeight: 900 }}>Scan Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    data-testid="language-select"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                    <option value="php">PHP</option>
                  </select>
                  {detectedLanguage && detectedLanguage !== language && (
                    <p className="text-xs text-emerald-400 mt-1" data-testid="detected-language">
                      Auto-detected: {detectedLanguage}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Context</label>
                  <select
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    data-testid="project-context-select"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Government">Government</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Scan Profile</label>
                  <select
                    value={scanProfile}
                    onChange={(e) => setScanProfile(e.target.value)}
                    data-testid="scan-profile-select"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Fast">Fast</option>
                    <option value="Deep">Deep</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                
                <button
                  onClick={loadDemoCode}
                  data-testid="load-demo-code-btn"
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Code className="w-4 h-4" />
                  Load Demo Code
                </button>
              </div>
            </div>
            
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ fontWeight: 900 }}>Scan Features</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>OWASP Top 10 detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>AI cognitive analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Attack simulation</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>Compliance mapping</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ fontWeight: 900 }}>Code Input</h3>
                <button
                  data-testid="upload-file-btn"
                  className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
              </div>
              
              <textarea
                value={code}
                onChange={handleCodeChange}
                data-testid="code-editor"
                placeholder="Paste your code here or load demo code..."
                className="w-full h-96 bg-[#0b101b] border border-white/10 rounded-lg p-4 text-slate-100 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              />
              
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  {code.length > 0 && (
                    <span data-testid="code-stats">{code.split('\n').length} lines, {code.length} characters</span>
                  )}
                </div>
                
                <button
                  onClick={analyzeCode}
                  disabled={isAnalyzing}
                  data-testid="analyze-code-btn"
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      Analyze Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}