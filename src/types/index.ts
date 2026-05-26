export type Technique =
  | 'normale'
  | 'drop-set'
  | 'tut'
  | 'superserie'
  | 'rest-pause'
  | 'myo-reps'
  | 'giant-set';

export const TECHNIQUES: { value: Technique; label: string; desc: string; color: string }[] = [
  { value: 'normale',    label: 'Normale',       desc: 'Nessuna tecnica speciale',                      color: '' },
  { value: 'drop-set',   label: 'Drop Set',       desc: 'Riduci il peso di serie in serie senza pausa', color: '#ef4444' },
  { value: 'tut',        label: 'TUT',            desc: 'Controlla il tempo di ogni fase del movimento', color: '#3b82f6' },
  { value: 'superserie', label: 'SuperSerie',     desc: 'Due esercizi consecutivi senza recupero',      color: '#8b5cf6' },
  { value: 'rest-pause', label: 'Rest-Pause',     desc: 'Breve pausa (10-20s) dentro la stessa serie',  color: '#06b6d4' },
  { value: 'myo-reps',   label: 'Myo-Reps',       desc: 'Serie attivazione + mini-serie con pausa corta', color: '#22c55e' },
  { value: 'giant-set',  label: 'Giant Set',      desc: '3+ esercizi consecutivi senza recupero',       color: '#f59e0b' },
];

export type MuscleGroup =
  | 'Petto'
  | 'Schiena'
  | 'Spalle'
  | 'Bicipiti'
  | 'Tricipiti'
  | 'Gambe'
  | 'Glutei'
  | 'Core'
  | 'Altro';

export interface LoggedSet {
  reps: number;
  weight: number;
}

export interface LoggedExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: LoggedSet[];
  technique?: Technique;
  tempo?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  notes?: string;
  exercises: LoggedExercise[];
  duration?: number;
}

export interface ProgramExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  technique?: Technique;
  tempo?: string;
  notes?: string;
}

export interface ProgramDay {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  days: ProgramDay[];
  createdAt: string;
}

export const COMMON_EXERCISES: { name: string; muscleGroup: MuscleGroup }[] = [
  { name: 'Panca Piana', muscleGroup: 'Petto' },
  { name: 'Panca Inclinata', muscleGroup: 'Petto' },
  { name: 'Croci ai Cavi', muscleGroup: 'Petto' },
  { name: 'Dip', muscleGroup: 'Petto' },
  { name: 'Pec Deck', muscleGroup: 'Petto' },
  { name: 'Stacco da Terra', muscleGroup: 'Schiena' },
  { name: 'Trazioni', muscleGroup: 'Schiena' },
  { name: 'Rematore Bilanciere', muscleGroup: 'Schiena' },
  { name: 'Lat Machine', muscleGroup: 'Schiena' },
  { name: 'Rematore Manubrio', muscleGroup: 'Schiena' },
  { name: 'Face Pull', muscleGroup: 'Schiena' },
  { name: 'Lento Avanti', muscleGroup: 'Spalle' },
  { name: 'Alzate Laterali', muscleGroup: 'Spalle' },
  { name: 'Arnold Press', muscleGroup: 'Spalle' },
  { name: 'Alzate Frontali', muscleGroup: 'Spalle' },
  { name: 'Curl Bilanciere', muscleGroup: 'Bicipiti' },
  { name: 'Curl Manubri', muscleGroup: 'Bicipiti' },
  { name: 'Curl Martello', muscleGroup: 'Bicipiti' },
  { name: 'Curl ai Cavi', muscleGroup: 'Bicipiti' },
  { name: 'Push Down Cavi', muscleGroup: 'Tricipiti' },
  { name: 'French Press', muscleGroup: 'Tricipiti' },
  { name: 'Tricipiti ai Cavi', muscleGroup: 'Tricipiti' },
  { name: 'Kickback Manubri', muscleGroup: 'Tricipiti' },
  { name: 'Squat', muscleGroup: 'Gambe' },
  { name: 'Leg Press', muscleGroup: 'Gambe' },
  { name: 'Affondi', muscleGroup: 'Gambe' },
  { name: 'Leg Curl', muscleGroup: 'Gambe' },
  { name: 'Leg Extension', muscleGroup: 'Gambe' },
  { name: 'Calf Raise', muscleGroup: 'Gambe' },
  { name: 'Hip Thrust', muscleGroup: 'Glutei' },
  { name: 'Abductor Machine', muscleGroup: 'Glutei' },
  { name: 'Romanian Deadlift', muscleGroup: 'Glutei' },
  { name: 'Plank', muscleGroup: 'Core' },
  { name: 'Crunch', muscleGroup: 'Core' },
  { name: 'Russian Twist', muscleGroup: 'Core' },
  { name: 'Leg Raise', muscleGroup: 'Core' },
];

export const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  Petto: '#ef4444',
  Schiena: '#3b82f6',
  Spalle: '#8b5cf6',
  Bicipiti: '#f97316',
  Tricipiti: '#f59e0b',
  Gambe: '#22c55e',
  Glutei: '#ec4899',
  Core: '#06b6d4',
  Altro: '#6b7280',
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Petto', 'Schiena', 'Spalle', 'Bicipiti', 'Tricipiti',
  'Gambe', 'Glutei', 'Core', 'Altro',
];
