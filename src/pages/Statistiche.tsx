import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell,
} from 'recharts';
import type { WorkoutSession, MuscleGroup } from '../types';
import { MUSCLE_COLORS } from '../types';

interface Props {
  sessions: WorkoutSession[];
}

function getWeeklyData(sessions: WorkoutSession[]) {
  const result = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) - i * 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    const count = sessions.filter(s => {
      const d = new Date(s.date);
      return d >= monday && d < sunday;
    }).length;

    const label =
      i === 0
        ? 'Questa'
        : `${monday.getDate()}/${monday.getMonth() + 1}`;
    result.push({ week: label, allenamenti: count });
  }
  return result;
}

function getMuscleData(sessions: WorkoutSession[]) {
  const counts: Partial<Record<MuscleGroup, number>> = {};
  sessions.forEach(s =>
    s.exercises.forEach(ex => {
      counts[ex.muscleGroup] = (counts[ex.muscleGroup] ?? 0) + ex.sets.length;
    }),
  );
  return Object.entries(counts)
    .map(([name, sets]) => ({ name, sets, fill: MUSCLE_COLORS[name as MuscleGroup] }))
    .sort((a, b) => (b.sets ?? 0) - (a.sets ?? 0));
}

function getExerciseProgress(sessions: WorkoutSession[], exerciseName: string) {
  return [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .flatMap(s => {
      const ex = s.exercises.find(e => e.name === exerciseName);
      if (!ex || !ex.sets.length) return [];
      const maxWeight = Math.max(...ex.sets.map(set => set.weight));
      return [
        {
          date: new Date(s.date).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'short',
          }),
          peso: maxWeight,
        },
      ];
    });
}

function getRecords(sessions: WorkoutSession[]) {
  const records: Record<string, { weight: number; reps: number; date: string }> = {};
  sessions.forEach(s =>
    s.exercises.forEach(ex =>
      ex.sets.forEach(set => {
        if (set.weight > 0 && (!records[ex.name] || set.weight > records[ex.name].weight)) {
          records[ex.name] = { weight: set.weight, reps: set.reps, date: s.date };
        }
      }),
    ),
  );
  return Object.entries(records)
    .map(([name, r]) => ({ name, ...r }))
    .sort((a, b) => b.weight - a.weight);
}

function getAllExercises(sessions: WorkoutSession[]): string[] {
  const names = new Set<string>();
  sessions.forEach(s => s.exercises.forEach(ex => names.add(ex.name)));
  return Array.from(names).sort();
}

const tooltipStyle = {
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#f1f5f9',
};

export default function Statistiche({ sessions }: Props) {
  const [selectedEx, setSelectedEx] = useState('');

  if (!sessions.length) {
    return (
      <div className="page">
        <div className="page-header">
          <h2 className="page-title">Statistiche</h2>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Nessun dato ancora</h3>
          <p>Registra qualche allenamento per vedere le statistiche</p>
        </div>
      </div>
    );
  }

  const weekly = getWeeklyData(sessions);
  const muscleData = getMuscleData(sessions);
  const exerciseNames = getAllExercises(sessions);
  const progressData = selectedEx ? getExerciseProgress(sessions, selectedEx) : [];
  const records = getRecords(sessions);

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Statistiche</h2>
      </div>

      <div className="chart-card">
        <h3>Allenamenti per settimana</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weekly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(249,115,22,0.1)' }} />
            <Bar dataKey="allenamenti" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {muscleData.length > 0 && (
        <div className="chart-card">
          <h3>Volume per gruppo muscolare (serie)</h3>
          <ResponsiveContainer width="100%" height={muscleData.length * 36 + 40}>
            <BarChart
              data={muscleData}
              layout="vertical"
              margin={{ top: 4, right: 8, bottom: 0, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis
                type="number"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                width={72}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="sets" radius={[0, 4, 4, 0]}>
                {muscleData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill ?? '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {exerciseNames.length > 0 && (
        <div className="chart-card">
          <h3>Progresso esercizio</h3>
          <select
            className="form-input"
            value={selectedEx}
            onChange={e => setSelectedEx(e.target.value)}
            style={{ marginBottom: 16 }}
          >
            <option value="">Seleziona esercizio…</option>
            {exerciseNames.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {progressData.length > 1 && (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [`${v} kg`, 'Peso massimo']}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {progressData.length === 1 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Serve almeno 2 sessioni con questo esercizio per il grafico.
            </p>
          )}
          {selectedEx && progressData.length === 0 && (
            <p className="text-muted" style={{ fontSize: 13 }}>
              Nessun dato per questo esercizio.
            </p>
          )}
        </div>
      )}

      {records.length > 0 && (
        <div className="chart-card">
          <h3>Personal Record</h3>
          <div className="records-table">
            <div className="records-header">
              <span>Esercizio</span>
              <span>Peso max</span>
              <span>Reps</span>
            </div>
            {records.slice(0, 15).map(r => (
              <div key={r.name} className="record-row">
                <span>{r.name}</span>
                <span className="record-weight">{r.weight} kg</span>
                <span>{r.reps}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
