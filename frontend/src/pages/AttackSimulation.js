import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Zap, ArrowUp, Database, AlertTriangle, Users, Clock, Award } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AttackSimulation() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);
  
  useEffect(() => {
    axios.get(`${API}/attack-simulation/${scanId}`)
      .then(response => {
        setSimulation(response.data);
        setLoading(false);
        // Auto-progress through stages
        let stage = 0;
        const interval = setInterval(() => {
          stage++;
          if (stage <= response.data.stages.length) {
            setCurrentStage(stage);
          } else {
            clearInterval(interval);
          }
        }, 1500);
        return () => clearInterval(interval);
      })
      .catch(error => {
        console.error('Failed to load simulation:', error);
        setLoading(false);
      });
  }, [scanId]);
  
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Generating attack simulation...</p>
        </div>
      </div>
    );
  }
  
  if (!simulation) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-slate-300 mb-4">Simulation not available</p>
          <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }
  
  const getStageIcon = (iconName) => {
    const icons = {
      'search': Search,
      'zap': Zap,
      'arrow-up': ArrowUp,
      'database': Database,
      'alert-triangle': AlertTriangle
    };
    return icons[iconName] || AlertTriangle;
  };
  
  const getStageColor = (status) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'danger': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-slate-500/20 border-slate-500/30 text-slate-400';
    }
  };
  
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
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="attack-sim-title">
            Attack Simulation & Kill Chain
          </h1>
          <p className="text-slate-300">Visualizing real-world exploitation scenarios</p>
        </div>
        
        {/* Feasibility Score */}
        <div className="glass-card p-6 mb-8" data-testid="feasibility-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Attack Feasibility</h2>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-sm text-slate-400">Feasibility Score</span>
                <div className="text-2xl font-bold text-red-400">{simulation.feasibility_score}/10</div>
              </div>
              <div>
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time to Exploit
                </span>
                <div className="text-lg font-bold text-orange-400">{simulation.estimated_time_to_exploit}</div>
              </div>
              <div>
                <span className="text-sm text-slate-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Skill Level
                </span>
                <div className="text-lg font-bold text-yellow-400">{simulation.skill_level_required}</div>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full transition-all duration-1000"
              style={{ width: `${simulation.feasibility_score * 10}%` }}
            ></div>
          </div>
        </div>
        
        {/* Kill Chain Stages */}
        <div className="space-y-6 mb-8">
          {simulation.stages.map((stage, index) => {
            const StageIcon = getStageIcon(stage.icon);
            const isActive = index < currentStage;
            
            return (
              <div
                key={index}
                data-testid={`stage-${index}`}
                className={`glass-card p-6 transition-all duration-500 transform ${
                  isActive ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getStageColor(stage.status)}`}>
                    <StageIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold" style={{ fontWeight: 900 }}>
                        Stage {stage.stage}: {stage.name}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-400 font-bold">
                          BREACHED
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Impact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6" data-testid="impact-summary-card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Impact Summary</h2>
            </div>
            <p className="text-slate-200 leading-relaxed">{simulation.impact_summary}</p>
          </div>
          
          <div className="glass-card p-6" data-testid="citizen-impact-card">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Citizen Impact</h2>
            </div>
            <p className="text-slate-200 leading-relaxed">{simulation.citizen_impact}</p>
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(`/compliance/${scanId}`)}
            data-testid="view-compliance-btn"
            className="btn-primary"
          >
            View Compliance Report
          </button>
        </div>
      </div>
    </div>
  );
}