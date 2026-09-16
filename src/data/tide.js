// Única fonte dos dados simulados de maré, para que todas as telas mostrem os mesmos números.
// A série é gerada por um modelo semidiurno (período de 12h25) centrado na preamar das 16:40.
const PERIOD_H = 12.42;
const HIGH_AT_H = 16 + 40 / 60;
const MEAN_M = 2.275;
const AMPLITUDE_M = 1.175;
const READING_H = 14.25;
const STEP_MIN = 20;

const levelAt = (hour) => MEAN_M + AMPLITUDE_M * Math.cos((2 * Math.PI * (hour - HIGH_AT_H)) / PERIOD_H);
// Pancada de chuva vespertina com pico perto da preamar.
const rainAt = (hour) => 8 * Math.exp(-((hour - 16.7) ** 2) / (2 * 0.45 ** 2));

const pad = (value) => String(value).padStart(2, '0');
export const clockOf = (hour) => {
  const minutes = Math.round(hour * 60);
  return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;
};
const round = (value, digits) => Number(value.toFixed(digits));

// 04:00 até 03:40 do dia seguinte, a cada 20 min (horários únicos, usados como categoria no eixo X).
export const series = Array.from({ length: (24 * 60) / STEP_MIN }, (_, index) => {
  const hour = 4 + (index * STEP_MIN) / 60;
  return { hour, time: clockOf(hour), level: round(levelAt(hour), 2), rain: round(rainAt(hour), 1) };
});

const lowHour = HIGH_AT_H - PERIOD_H / 2;
const ATTENTION_M = 3.2;
// Momento em que a maré enchente cruza a cota de atenção, arredondado para baixo em 5 min.
const attentionHour = HIGH_AT_H - (Math.acos((ATTENTION_M - MEAN_M) / AMPLITUDE_M) * PERIOD_H) / (2 * Math.PI);
const safeUntilHour = Math.floor(attentionHour * 12) / 12;

export const tide = {
  station: 'Baía do Guajará',
  reading: clockOf(READING_H),
  readingHour: READING_H,
  current: round(levelAt(READING_H), 2),
  trend: `+${Math.round((levelAt(READING_H) - levelAt(READING_H - 1)) * 100)} cm na última hora`,
  low: { time: clockOf(lowHour), level: round(levelAt(lowHour), 2) },
  high: { time: clockOf(HIGH_AT_H), hour: HIGH_AT_H, level: round(levelAt(HIGH_AT_H), 2) },
  alertLevel: 3.5,
  attentionLevel: ATTENTION_M,
  safeUntil: clockOf(safeUntilHour),
  rain: { from: '16h15', to: '17h10', peak: 8 },
  temperature: 28,
  wind: '12 nós WNW',
};

export const store = { name: 'Empório da Maria', owner: 'Maria', neighborhood: 'Umarizal' };

export const formatLevel = (meters) => `${meters.toFixed(2).replace('.', ',')} m`;

const toMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };

export function formatDuration(from, to) {
  const minutes = toMinutes(to) - toMinutes(from);
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}
