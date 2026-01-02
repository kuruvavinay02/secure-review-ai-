import { useEffect, useState } from 'react';
import { GraduationCap, Award, BookOpen, Trophy, TrendingUp } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Education() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    completedLessons: 2,
    totalLessons: 5,
    score: 78,
    rank: 'Intermediate'
  });
  
  useEffect(() => {
    axios.get(`${API}/education/lessons`)
      .then(response => {
        setLessons(response.data.lessons || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load lessons:', error);
        setLoading(false);
      });
  }, []);
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };
  
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="education-title">
            Security Training & Education
          </h1>
          <p className="text-slate-300">Master secure coding practices and vulnerability prevention</p>
        </div>
        
        {/* User Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6" data-testid="progress-lessons">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progress</span>
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold mb-1" style={{ fontWeight: 900 }}>
              {userProgress.completedLessons}/{userProgress.totalLessons}
            </div>
            <div className="text-sm text-slate-400">Lessons Complete</div>
            <div className="w-full bg-white/5 rounded-full h-2 mt-3">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(userProgress.completedLessons / userProgress.totalLessons) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="glass-card p-6" data-testid="progress-score">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Score</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400" style={{ fontWeight: 900 }}>
              {userProgress.score}%
            </div>
            <div className="text-sm text-slate-400">Overall Performance</div>
          </div>
          
          <div className="glass-card p-6" data-testid="progress-rank">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Rank</span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400" style={{ fontWeight: 900 }}>
              {userProgress.rank}
            </div>
            <div className="text-sm text-slate-400">Skill Level</div>
          </div>
          
          <div className="glass-card p-6" data-testid="progress-achievements">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Achievements</span>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-yellow-400" style={{ fontWeight: 900 }}>
              5
            </div>
            <div className="text-sm text-slate-400">Badges Earned</div>
          </div>
        </div>
        
        {/* Learning Path */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontWeight: 900 }}>Learning Path</h2>
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-4">
              {['Basics', 'OWASP Top 10', 'Secure Code', 'Penetration Testing', 'Compliance'].map((stage, index) => (
                <div key={index} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    index < 2 ? 'bg-blue-500 border-blue-400' : 'bg-white/5 border-white/20'
                  }`}>
                    {index < 2 ? (
                      <span className="text-white font-bold">✓</span>
                    ) : (
                      <span className="text-slate-400">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm text-slate-300">{stage}</span>
                  {index < 4 && <div className="w-8 h-0.5 bg-white/20"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Lessons Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontWeight: 900 }}>Available Lessons</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading lessons...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  data-testid={`lesson-card-${index}`}
                  className="glass-card p-6 hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      lesson.completed ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                    }`}>
                      {lesson.completed ? (
                        <Trophy className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <GraduationCap className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2" style={{ fontWeight: 900 }}>{lesson.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{lesson.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{lesson.duration}</span>
                    <button
                      data-testid={`start-lesson-btn-${index}`}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      {lesson.completed ? 'Review' : 'Start Lesson'} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Safe Playground CTA */}
        <div className="mt-12 glass-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ fontWeight: 900 }}>Practice in a Safe Environment</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Try exploiting vulnerabilities in our sandboxed playground. Learn by doing, without risk.
          </p>
          <button
            data-testid="enter-playground-btn"
            className="btn-primary"
            onClick={() => alert('Opening secure playground... (Demo mode)')}
          >
            Enter Playground
          </button>
        </div>
      </div>
    </div>
  );
}