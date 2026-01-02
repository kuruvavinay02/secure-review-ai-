import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import '@/App.css';
import Navigation from '@/components/Navigation';
import Home from '@/pages/Home';
import SecureScan from '@/pages/SecureScan';
import Dashboard from '@/pages/Dashboard';
import IssueDetail from '@/pages/IssueDetail';
import AttackSimulation from '@/pages/AttackSimulation';
import SecureFix from '@/pages/SecureFix';
import Compliance from '@/pages/Compliance';
import Education from '@/pages/Education';
import Settings from '@/pages/Settings';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scan" element={<SecureScan />} />
          <Route path="/dashboard/:scanId" element={<Dashboard />} />
          <Route path="/issue/:issueId" element={<IssueDetail />} />
          <Route path="/attack-sim/:scanId" element={<AttackSimulation />} />
          <Route path="/secure-fix/:vulnId" element={<SecureFix />} />
          <Route path="/compliance/:scanId" element={<Compliance />} />
          <Route path="/education" element={<Education />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;