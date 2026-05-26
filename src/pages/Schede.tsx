import { useState } from 'react';
import type { WorkoutProgram, ProgramDay, ProgramExercise, MuscleGroup, Technique } from '../types';
import { MUSCLE_GROUPS, COMMON_EXERCISES, TECHNIQUES } from '../types';
import { Plus, X, Trash2, ChevronRight } from 'lucide-react';

interface Props {
  programs: WorkoutProgram[];
  setPrograms: (p: WorkoutProgram[]) => void;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

type View = 'list' | 'detail' | 'new' | 'edit';

export default function Schede({ programs, setPrograms }: Props) {
  const [view, setView] = useState<View>('list');
  const [selected, setSelected] = useState<WorkoutProgram | null>(null);

  // ── form state (shared by new + edit) ──────────────────────────────────
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [days, setDays] = useState<ProgramDay[]>([]);
  const [newDayName, setNewDayName] = useState('');
  const [showAddDay, setShowAddDay] = useState(false);

  // ── exercise picker ─────────────────────────────────────────────────────
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState<MuscleGroup>('Altro');

  const filtered = COMMON_EXERCISES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openNew() {
    setPName('');
    setPDesc('');
    setDays([]);
    setShowAddDay(false);
    setView('new');
  }

  function openEdit(program: WorkoutProgram) {
    setPName(program.name);
    setPDesc(program.description ?? '');
    // Deep-clone days so edits don't mutate the original
    setDays(JSON.parse(JSON.stringify(program.days)));
    setShowAddDay(false);
    setSelected(program);
    setView('edit');
  }

  function saveEdit() {
    if (!selected) return;
    const updated: WorkoutProgram = {
      ...selected,
      name: pName.trim() || 'Scheda',
      description: pDesc.trim() || undefined,
      days,
    };
    setPrograms(programs.map(p => (p.id === selected.id ? updated : p)));
    setSelected(updated);
    setView('detail');
  }

  function addDay() {
    if (!newDayName.trim()) return;
    setDays(prev => [...prev, { id: genId(), name: newDayName.trim(), exercises: [] }]);
    setNewDayName('');
    setShowAddDay(false);
  }

  function removeDay(id: string) {
    setDays(prev => prev.filter(d => d.id !== id));
  }

  function addExToDay(dayId: string, name: string, muscleGroup: MuscleGroup) {
    setDays(prev =>
      prev.map(d =>
        d.id === dayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  id: genId(),
                  name,
                  muscleGroup,
                  targetSets: 3,
                  targetReps: '8-12',
                  restSeconds: 90,
                },
              ],
            }
          : d,
      ),
    );
    setPickerDayId(null);
    setSearch('');
    setCustomName('');
  }

  function removeEx(dayId: string, exId: string) {
    setDays(prev =>
      prev.map(d =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) } : d,
      ),
    );
  }

  function updateEx(
    dayId: string,
    exId: string,
    field: keyof ProgramExercise,
    value: string | number,
  ) {
    setDays(prev =>
      prev.map(d =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map(e =>
                e.id === exId ? { ...e, [field]: value } : e,
              ),
            }
          : d,
      ),
    );
  }

  function saveProgram() {
    const prog: WorkoutProgram = {
      id: genId(),
      name: pName.trim() || 'Nuova Scheda',
      description: pDesc.trim() || undefined,
      days,
      createdAt: new Date().toISOString(),
    };
    setPrograms([...programs, prog]);
    setView('list');
  }

  function deleteProgram(id: string) {
    if (!confirm('Eliminare questa scheda?')) return;
    setPrograms(programs.filter(p => p.id !== id));
    setView('list');
  }

  // ── NEW / EDIT PROGRAM VIEW (shared form) ──────────────────────────────
  if (view === 'new' || view === 'edit') {
    const isEdit = view === 'edit';
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => (isEdit ? setView('detail') : setView('list'))}>
            <X size={16} /> Annulla
          </button>
          <h2 className="page-title">{isEdit ? 'Modifica Scheda' : 'Nuova Scheda'}</h2>
          <button className="btn btn-primary" onClick={isEdit ? saveEdit : saveProgram}>
            Salva
          </button>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Nome scheda</label>
            <input
              className="form-input"
              placeholder="Push Pull Legs, Full Body…"
              value={pName}
              onChange={e => setPName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Descrizione</label>
            <input
              className="form-input"
              placeholder="es. 3 giorni a settimana, ipertrofia"
              value={pDesc}
              onChange={e => setPDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="days-section">
          <div className="section-header">
            <h3>Giorni ({days.length})</h3>
            <button className="btn btn-ghost" onClick={() => setShowAddDay(v => !v)}>
              <Plus size={15} /> Aggiungi giorno
            </button>
          </div>

          {showAddDay && (
            <div className="add-day-form">
              <input
                autoFocus
                className="form-input"
                placeholder="Nome giorno (Push, Gambe, Schiena…)"
                value={newDayName}
                onChange={e => setNewDayName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDay()}
              />
              <button className="btn btn-primary" onClick={addDay}>
                Aggiungi
              </button>
            </div>
          )}

          {days.map(day => (
            <div key={day.id} className="day-card">
              <div className="day-card-header">
                <h4>{day.name}</h4>
                <button className="btn-icon" onClick={() => removeDay(day.id)}>
                  <Trash2 size={15} />
                </button>
              </div>

              {day.exercises.map(ex => (
                <div key={ex.id} className="program-exercise-row">
                  <div className="program-ex-name">
                    <span>{ex.name}</span>
                    <span className="exercise-group-tag small">{ex.muscleGroup}</span>
                  </div>
                  <div className="program-ex-fields">
                    <label>
                      <span>Serie</span>
                      <input
                        type="number"
                        className="set-input"
                        value={ex.targetSets}
                        min="1"
                        onChange={e =>
                          updateEx(day.id, ex.id, 'targetSets', parseInt(e.target.value) || 1)
                        }
                      />
                    </label>
                    <label>
                      <span>Reps</span>
                      <input
                        type="text"
                        className="set-input wide"
                        value={ex.targetReps}
                        onChange={e => updateEx(day.id, ex.id, 'targetReps', e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Rec (s)</span>
                      <input
                        type="number"
                        className="set-input"
                        value={ex.restSeconds}
                        min="0"
                        step="15"
                        onChange={e =>
                          updateEx(day.id, ex.id, 'restSeconds', parseInt(e.target.value) || 0)
                        }
                      />
                    </label>
                    <label>
                      <span>Tecnica</span>
                      <select
                        className="technique-select"
                        value={ex.technique ?? 'normale'}
                        onChange={e => updateEx(day.id, ex.id, 'technique', e.target.value as Technique)}
                      >
                        {TECHNIQUES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </label>
                    {ex.technique === 'tut' && (
                      <label>
                        <span>Tempo</span>
                        <input
                          type="text"
                          className="set-input wide"
                          placeholder="3-1-3-0"
                          value={ex.tempo ?? ''}
                          onChange={e => updateEx(day.id, ex.id, 'tempo', e.target.value)}
                        />
                      </label>
                    )}
                    <button className="btn-icon small" onClick={() => removeEx(day.id, ex.id)}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                className="btn btn-ghost small"
                onClick={() => {
                  setPickerDayId(day.id);
                  setSearch('');
                  setCustomName('');
                }}
              >
                <Plus size={14} /> Esercizio
              </button>
            </div>
          ))}
        </div>

        {pickerDayId && (
          <div className="modal-overlay" onClick={() => setPickerDayId(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Aggiungi esercizio</h3>
                <button className="btn-icon" onClick={() => setPickerDayId(null)}>
                  <X size={18} />
                </button>
              </div>
              <input
                autoFocus
                className="form-input"
                placeholder="Cerca…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="exercise-list">
                {filtered.map(ex => (
                  <button
                    key={ex.name}
                    className="exercise-list-item"
                    onClick={() => addExToDay(pickerDayId, ex.name, ex.muscleGroup)}
                  >
                    <span>{ex.name}</span>
                    <span className="text-muted">{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
              <div className="modal-divider">personalizzato</div>
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
                  onClick={() => addExToDay(pickerDayId, customName.trim(), customGroup)}
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => setView('list')}>
            ← Indietro
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ margin: 0 }} onClick={() => openEdit(selected)}>
              Modifica
            </button>
            <button className="btn btn-danger" onClick={() => deleteProgram(selected.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h2 style={{ marginBottom: 4 }}>{selected.name}</h2>
        {selected.description && (
          <p className="text-muted" style={{ marginBottom: 20 }}>
            {selected.description}
          </p>
        )}
        <div style={{ marginBottom: 20 }}>
          <span className="badge">{selected.days.length} giorni</span>
          <span className="badge" style={{ marginLeft: 8 }}>
            {selected.days.reduce((t, d) => t + d.exercises.length, 0)} esercizi totali
          </span>
        </div>

        {selected.days.map(day => (
          <div key={day.id} className="day-card readonly">
            <h4 style={{ marginBottom: 12 }}>{day.name}</h4>
            {day.exercises.map(ex => (
              <div key={ex.id} className="program-exercise-row readonly">
                <div className="program-ex-name">
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-group-tag small">{ex.muscleGroup}</span>
                </div>
                <div className="program-ex-summary">
                  {ex.targetSets}×{ex.targetReps}
                  {ex.restSeconds > 0 && <span className="text-muted"> · {ex.restSeconds}s rec</span>}
                  {ex.technique && ex.technique !== 'normale' && (
                    <SchedaTechniqueBadge technique={ex.technique} tempo={ex.tempo} />
                  )}
                </div>
              </div>
            ))}
            {day.exercises.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13 }}>
                Nessun esercizio
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Schede</h2>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} /> Nuova
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗂️</div>
          <h3>Nessuna scheda creata</h3>
          <p>Crea la tua prima scheda di allenamento</p>
          <button className="btn btn-primary" onClick={openNew}>
            Crea scheda
          </button>
        </div>
      ) : (
        <div className="programs-grid">
          {programs.map(p => (
            <div
              key={p.id}
              className="program-card"
              onClick={() => {
                setSelected(p);
                setView('detail');
              }}
            >
              <div className="program-card-name">{p.name}</div>
              {p.description && (
                <div className="program-card-desc">{p.description}</div>
              )}
              <div className="program-card-meta">
                {p.days.length} giorni ·{' '}
                {p.days.reduce((t, d) => t + d.exercises.length, 0)} esercizi
              </div>
              <div className="program-card-days">
                {p.days.map(d => (
                  <span key={d.id} className="day-tag">
                    {d.name}
                  </span>
                ))}
              </div>
              <ChevronRight size={16} className="program-card-arrow text-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchedaTechniqueBadge({ technique, tempo }: { technique: Technique; tempo?: string }) {
  const t = TECHNIQUES.find(x => x.value === technique);
  if (!t || technique === 'normale') return null;
  return (
    <span
      className="technique-badge"
      style={{ background: t.color + '22', color: t.color, borderColor: t.color + '55', marginLeft: 8 }}
    >
      {t.label}{tempo ? ` · ${tempo}` : ''}
    </span>
  );
}
