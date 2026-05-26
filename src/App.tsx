import { useState } from 'react';
import { Dumbbell, BookOpen, BarChart3, LayoutDashboard } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { WorkoutSession, WorkoutProgram } from './types';
import Dashboard from './pages/Dashboard';
import Diario from './pages/Diario';
import Schede from './pages/Schede';
import Statistiche from './pages/Statistiche';

type Page = 'dashboard' | 'diario' | 'schede' | 'statistiche';

const NAV: { id: Page; label: string; Icon: typeof Dumbbell }[] = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'diario', label: 'Diario', Icon: BookOpen },
  { id: 'schede', label: 'Schede', Icon: Dumbbell },
  { id: 'statistiche', label: 'Stats', Icon: BarChart3 },
];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [sessions, setSessions] = useLocalStorage<WorkoutSession[]>('gym_sessions', []);
  const [programs, setPrograms] = useLocalStorage<WorkoutProgram[]>('gym_programs', []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <Dumbbell size={22} />
          <span>GymLog</span>
        </div>
        <nav className="header-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-btn${page === id ? ' active' : ''}`}
              onClick={() => setPage(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard sessions={sessions} programs={programs} onNavigate={setPage} />
        )}
        {page === 'diario' && (
          <Diario sessions={sessions} setSessions={setSessions} programs={programs} />
        )}
        {page === 'schede' && (
          <Schede programs={programs} setPrograms={setPrograms} />
        )}
        {page === 'statistiche' && <Statistiche sessions={sessions} />}
      </main>
    </div>
  );
}
