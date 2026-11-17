// Sample data for the /design page and the mock provider. Posters are placeholder gradients, not media.
import type { ModelOption } from '@/components/ui/ModelPicker';
import type { Preset } from '@/components/ui/PresetGrid';
const g = (a: string, b: string, deg = 160) => `linear-gradient(${deg}deg, ${a}, ${b})`;
export const POSTERS = [g('#1e3a5f', '#d97742'), g('#2b1d4e', '#6fd3c1'), g('#0f2f1f', '#c9d36b', 200), g('#3d0f2a', '#f2a65a'), g('#11243d', '#8fb0ff', 120), g('#2a2a2a', '#e5e5e5', 180)];
export const MODELS: ModelOption[] = [
  { id: 'fast', name: 'Rápido', strength: 'Pruebas e ideas, en menos de un minuto', speed: 'rápido', quality: 'buena', fromCredits: 4 },
  { id: 'cine', name: 'Cine', strength: 'Movimiento de cámara suave y realista', speed: 'medio', quality: 'alta', fromCredits: 12 },
  { id: 'pro', name: 'Pro', strength: 'La máxima calidad, para el plano final', speed: 'lento', quality: 'máxima', fromCredits: 30 },
  { id: 'anim', name: 'Animación', strength: 'Ilustración y estilo dibujado', speed: 'medio', quality: 'alta', fromCredits: 10, disabledReason: 'No admite 1:1' },
];
export const PRESETS: Preset[] = [
  ['dolly-in', 'Acercamiento', 'Empuje'], ['dolly-out', 'Alejamiento', 'Empuje'], ['crash-zoom', 'Zoom brusco', 'Empuje'],
  ['orbit', 'Órbita', 'Giro'], ['pan-left', 'Paneo izquierda', 'Giro'], ['tilt-up', 'Inclinación arriba', 'Giro'],
  ['crane-up', 'Grúa arriba', 'Altura'], ['drone', 'Dron', 'Altura'], ['handheld', 'Cámara en mano', 'Estilo'], ['static', 'Fija', 'Estilo'],
].map(([id, name, category], i) => ({ id, name, category, poster: POSTERS[i % POSTERS.length] }));
