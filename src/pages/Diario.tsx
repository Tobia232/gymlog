import { useState } from 'react';
import type { WorkoutSession, LoggedExercise, LoggedSet, WorkoutProgram, MuscleGroup, Technique } from '../types';
import { COMMON_EXERCISES, MUSCLE_GROUPS, TECHNIQUES } from '../types';
import { Plus, X, Trash2, ChevronRight } from 'lucide-react';

interface Props {
  sessions: WorkoutSession[];
  setSessions: (s: WorkoutSession[]) => void;
  programs: WorkoutProgram[];
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type View = 'list' | 'detail' | 'new';

export default function Diario({ sessions, setSessions, programs }: Props) {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<WorkoutSession | null>(null);

  // ── new session form state ──────────────────────────────────────────────
  const [name, setName] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [programId, setProgramId] = useState('');
  const [dayId, setDayId] = useState('');

  // ── exercise picker state ───────────────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState<MuscleGroup>('Altro');

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Group by "Month YYYY"
  const grouped: Record<string, WorkoutSession[]> = {};
  sorted.forEach(s => {
    const key = new Date(s.date).toLocaleDateString('it-IT', {
      month: 'long',
      year: 'numeric',
    });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  function openNew() {
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setExercises([]);
    setProgramId('');
    setDayId('');
    setView('new');
  }

  function loadFromDay(pId: string, dId: string) {
    const prog = programs.find(p => p.id === pId);
    const day = prog?.days.find(d => d.id === dId);
    if (!day) return;
    setName(day.name);
    setExercises(
      day.exercises.map(ex => ({
        id: genId(),
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: Array.from({ length: ex.targetSets }, () => ({ reps: 0, weight: 0 })),
      })),
    );
  }

  function addExercise(exName: string, group: MuscleGroup) {
    setExercises(prev => [
      ...prev,
      { id: genId(), name: exName, muscleGroup: group, sets: [{ reps: 0, weight: 0 }] },
    ]);
    setShowPicker(false);
    setSearch('');
    setCustomName('');
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id));
  }

  function addSet(exId: string) {
    setExercises(prev =>
      prev.map(e => (e.id === exId ? { ...e, sets: [...e.sets, { reps: 0, weight: 0 }] } : e)),
    );
  }

  function removeSet(exId: string, idx: number) {
    setExercises(prev =>
      prev.map(e =>
        e.id === exId ? { ...e, sets: e.sets.filter((_, i) => i !== idx) } : e,
      ),
    );
  }

  function updateSet(exId: string, idx: number, field: keyof LoggedSet, val: number) {
    setExercises(prev =>
      prev.map(e =>
        e.id === exId
          ? { ...e, sets: e.sets.map((s, i) => (i === idx ? { ...s, [field]: val } : s)) }
          : e,
      ),
    );
  }

  function updateTechnique(exId: string, technique: Technique) {
    setExercises(prev =>
      prev.map(e => (e.id === exId ? { ...e, technique, tempo: technique !== 'tut' ? undefined : e.tempo } : e)),
    );
  }

  function updateTempo(exId: string, tempo: string) {
    setExercises(prev => prev.map(e => (e.id === exId ? { ...e, tempo } : e)));
  }

  function save() {
    const session: WorkoutSession = {
      id: genId(),
      date,
      name: name.trim() || 'Allenamento',
      notes: notes.trim() || undefined,
      exercises,
    };
    setSessions([...sessions, session]);
    setView('list');
  }

  function deleteSession(id: string) {
    if (!confirm('Eliminare questo allenamento?')) return;
    setSessions(sessions.filter(s => s.id !== id));
    setView('list');
  }

  const filteredCommon = COMMON_EXERCISES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── NEW SESSION VIEW ────────────────────────────────────────────────────
  if (view === 'new') {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => setView('list')}>
            <X size={16} /> Annulla
          </button>
          <h2 className="page-title">Nuovo Allenamento</h2>
          <button className="btn btn-primary" onClick={save}>
            Salva
          </button>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Nome</label>
            <input
              className="form-input"
              placeholder="Push Day, Gambe, Full Body…"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {programs.length > 0 && (
            <div className="form-group">
              <label>Carica da scheda</label>
              <select
                className="form-input"
                value={programId}
                onChange={e => {
                  setProgramId(e.target.value);
                  setDayId('');
                }}
              >
                <option value="">— nessuna —</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {programId && (
                <select
                  className="form-input"
                  style={{ marginTop: 8 }}
                  value={dayId}
                  onChange={e => {
                    setDayId(e.target.value);
                    if (e.target.value) loadFromDay(programId, e.target.value);
                  }}
                >
                  <option value="">Seleziona giorno…</option>
                  {programs
                    .find(p => p.id === programId)
                    ?.days.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}
        </div>

        <div className="exercises-section">
          <h3>Esercizi</h3>
          {exercises.map(ex => (
            <div key={ex.id} className="exercise-card">
              <div className="exercise-card-header">
                <div>
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-group-tag">{ex.muscleGroup}</span>
                </div>
                <button className="btn-icon" onClick={() => removeExercise(ex.id)}>
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="technique-row">
                <select
                  className="technique-select"
                  value={ex.technique ?? 'normale'}
                  onChange={e => updateTechnique(ex.id, e.target.value as Technique)}
                >
                  {TECHNIQUES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {ex.technique && ex.technique !== 'normale' && (
                  <TechniqueBadge technique={ex.technique} />
                )}
                {ex.technique === 'tut' && (
                  <input
                    className="form-input tempo-input"
                    placeholder="Tempo es. 3-1-3-0"
                    value={ex.tempo ?? ''}
                    onChange={e => updateTempo(ex.id, e.target.value)}
                  />
                )}
              </div>

              <div className="sets-table">
                <div className="sets-header">
                  <span>#</span>
                  <span>Peso (kg)</span>
                  <span>Reps</span>
                  <span />
                </div>
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row">
                    <span className="set-number">{i + 1}</span>
                    <input
                      type="number"
                      className="set-input"
                      value={set.weight || ''}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      onChange={e =>
                        updateSet(ex.id, i, 'weight', parseFloat(e.target.value) || 0)
                      }
                    />
                    <input
                      type="number"
                      className="set-input"
                      value={set.reps || ''}
                      placeholder="0"
                      min="0"
                      onChange={e =>
                        updateSet(ex.id, i, 'reps', parseInt(e.target.value) || 0)
                      }
                    />
                    <button
                      className="btn-icon small"
                      onClick={() => removeSet(ex.id, i)}
                      disabled={ex.sets.length === 1}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn btn-ghost small" onClick={() => addSet(ex.id)}>
                <Plus size={13} /> Serie
              </button>
            </div>
          ))}

          <button className="btn btn-outline" onClick={() => setShowPicker(true)}>
            <Plus size={16} /> Aggiungi esercizio
          </button>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Note</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Come ti sei sentito, cosa migliorare…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {showPicker && (
          <ExercisePicker
            search={search}
            setSearch={setSearch}
            filtered={filteredCommon}
            customName={customName}
            setCustomName={setCustomName}
            customGroup={customGroup}
            setCustomGroup={setCustomGroup}
            onAdd={addExercise}
            onClose={() => setShowPicker(false)}
          />
        )}
      </div>
    );
  }

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    const totalSets = selected.exercises.reduce((t, e) => t + e.sets.length, 0);
    const totalVol = selected.exercises.reduce(
      (t, e) => t + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0,
    );

    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => setView('list')}>
            ← Indietro
          </button>
          <button className="btn btn-danger" onClick={() => deleteSession(selected.id)}>
            <Trash2 size={16} />
          </button>
        </div>

        <div className="session-detail">
          <h2>{selected.name}</h2>
          <p className="text-muted" style={{ marginBottom: 16 }}>
            {formatDate(selected.date)}
          </p>

          <div className="session-stats">
            <div className="session-stat">
              <strong>{selected.exercises.length}</strong>
              <span>esercizi</span>
            </div>
            <div className="session-stat">
              <strong>{totalSets}</strong>
              <span>serie</span>
            </div>
            <div className="session-stat">
              <strong>{totalVol.toLocaleString('it-IT')}</strong>
              <span>kg volume</span>
            </div>
          </div>

          {selected.notes && <p className="session-notes">{selected.notes}</p>}

          {selected.exercises.map(ex => (
            <div key={ex.id} className="exercise-card readonly">
              <div className="exercise-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-group-tag">{ex.muscleGroup}</span>
                  {ex.technique && ex.technique !== 'normale' && (
                    <TechniqueBadge technique={ex.technique} tempo={ex.tempo} />
                  )}
                </div>
              </div>
              <div className="sets-table">
                <div className="sets-header">
                  <span>#</span>
                  <span>Peso</span>
                  <span>Reps</span>
                </div>
                {ex.sets.map((set, i) => (
                  <div key={i} className="set-row readonly">
                    <span className="set-number">{i + 1}</span>
                    <span>{set.weight} kg</span>
                    <span>{set.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Diario</h2>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nuovo
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Nessun allenamento registrato</h3>
          <p>Registra la tua prima sessione!</p>
          <button className="btn btn-primary" onClick={openNew}>
            Inizia ora
          </button>
        </div>
      ) : (
        <div className="sessions-list">
          {Object.entries(grouped).map(([month, list]) => (
            <div key={month}>
              <div className="month-header">{month}</div>
              {list.map(s => {
                const totalEx = s.exercises.length;
                const totalS = s.exercises.reduce((t, e) => t + e.sets.length, 0);
                return (
                  <div
                    key={s.id}
                    className="session-card"
                    onClick={() => {
                      setSelected(s);
                      setView('detail');
                    }}
                  >
                    <div className="session-card-date">
                      <span className="session-day">{new Date(s.date).getDate()}</span>
                      <span className="session-weekday">
                        {new Date(s.date).toLocaleDateString('it-IT', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="session-card-info">
                      <div className="session-card-name">{s.name}</div>
                      <div className="session-card-meta">
                        {totalEx} esercizi · {totalS} serie
                      </div>
                      <div className="session-card-exercises">
                        {s.exercises.slice(0, 3).map(ex => (
                          <span key={ex.id} className="exercise-tag">
                            {ex.name}
                          </span>
                        ))}
                        {s.exercises.length > 3 && (
                          <span className="exercise-tag">+{s.exercises.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Technique Badge ──────────────────────────────────────────────────────
function TechniqueBadge({ technique, tempo }: { technique: Technique; tempo?: string }) {
  const t = TECHNIQUES.find(x => x.value === technique);
  if (!t || technique === 'normale') return null;
  return (
    <span className="technique-badge" style={{ background: t.color + '22', color: t.color, borderColor: t.color + '55' }}>
      {t.label}{tempo ? ` · ${tempo}` : ''}
    </span>
  );
}

// ── Exercise Picker Modal ────────────────────────────────────────────────
interface PickerProps {
  search: string;
  setSearch: (v: string) => void;
  filtered: { name: string; muscleGroup: MuscleGroup }[];
  customName: string;
  setCustomName: (v: string) => void;
  customGroup: MuscleGroup;
  setCustomGroup: (v: MuscleGroup) => void;
  onAdd: (name: string, group: MuscleGroup) => void;
  onClose: () => void;
}

function ExercisePicker({
  search, setSearch, filtered, customName, setCustomName,
  customGroup, setCustomGroup, onAdd, onClose,
}: PickerProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Aggiungi esercizio</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <input
          autoFocus
          className="form-input"
          placeholder="Cerca esercizio…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="exercise-list">
          {filtered.map(ex => (
            <button
              key={ex.name}
              className="exercise-list-item"
              onClick={() => onAdd(ex.name, ex.muscleGroup)}
            >
              <span>{ex.name}</span>
              <span className="text-muted">{ex.muscleGroup}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted" style={{ padding: '8px 0' }}>
              Nessun risultato
            </p>
          )}
        </div>

        <div className="modal-divider">oppure personalizzato</div>

        <div className="custom-exercise-form">
          <input
            className="form-input"
            placeholder="Nome esercizio"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
          <select
            className="form-input"
            value={customGroup}
            onChange={e => setCustomGroup(e.target.value as MuscleGroup)}
          >
            {MUSCLE_GROUPS.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            disabled={!customName.trim()}
            onClick={() => onAdd(customName.trim(), customGroup)}
          >
            Aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}
