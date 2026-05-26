import type { WorkoutSession, WorkoutProgram } from '../types';
import { Dumbbell, Calendar, TrendingUp, Zap, ChevronRight } from 'lucide-react';

type Page = 'dashboard' | 'diario' | 'schede' | 'statistiche';

interface Props {
  sessions: WorkoutSession[];
  programs: WorkoutProgram[];
  onNavigate: (page: Page) => void;
}

function getThisWeekCount(sessions: WorkoutSession[]): number {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return sessions.filter(s => new Date(s.date) >= monday).length;
}

function getStreak(sessions: WorkoutSession[]): number {
  if (!sessions.length) return 0;
  const dates = new Set(sessions.map(s => s.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (dates.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getTotalVolume(session: WorkoutSession): number {
  return session.exercises.reduce(
    (t, ex) => t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    0,
  );
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export default function Dashboard({ sessions, programs, onNavigate }: Props) {
  const thisWeek = getThisWeekCount(sessions);
  const streak = getStreak(sessions);
  const lastSession = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  const now = new Date();
  const dateStr = `${DAY_NAMES[now.getDay()]} ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ciao, atleta!</h1>
          <p className="text-muted">{dateStr}</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('diario')}>
          <Dumbbell size={16} />
          Allenati
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-value">{thisWeek}</div>
            <div className="stat-label">Questa settimana</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <Zap size={20} />
          </div>
          <div>
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Giorni streak</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">{sessions.length}</div>
            <div className="stat-label">Tot. sessioni</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Dumbbell size={20} />
          </div>
          <div>
            <div className="stat-value">{programs.length}</div>
            <div className="stat-label">Schede</div>
          </div>
        </div>
      </div>

      {lastSession ? (
        <div className="card" onClick={() => onNavigate('diario')} style={{ cursor: 'pointer' }}>
          <div className="card-header">
            <h3>Ultimo allenamento</h3>
            <span className="badge">
              {new Date(lastSession.date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
          <div className="card-body">
            <div className="last-session-name">{lastSession.name}</div>
            <div className="last-session-exercises">
              {lastSession.exercises.map(ex => (
                <span key={ex.id} className="exercise-tag">
                  {ex.name}
                </span>
              ))}
            </div>
            <div className="last-session-volume">
              Volume:{' '}
              <strong>{getTotalVolume(lastSession).toLocaleString('it-IT')} kg</strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="card empty-state">
          <Dumbbell size={48} className="empty-icon-svg" />
          <h3>Nessun allenamento ancora</h3>
          <p>Registra la tua prima sessione!</p>
          <button className="btn btn-primary" onClick={() => onNavigate('diario')}>
            Inizia ora
          </button>
        </div>
      )}

      {programs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Le tue schede</h3>
            <button className="btn btn-ghost" onClick={() => onNavigate('schede')}>
              Vedi tutte
            </button>
          </div>
          <div className="programs-list">
            {programs.slice(0, 3).map(p => (
              <div
                key={p.id}
                className="program-item"
                onClick={() => onNavigate('schede')}
              >
                <span>{p.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="text-muted">{p.days.length} giorni</span>
                  <ChevronRight size={14} className="text-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
