'use client';
import { useState } from 'react';
import { Film, Plus, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PromptBox } from '@/components/ui/PromptBox';
import { ImageDropzone, checkImage } from '@/components/ui/ImageDropzone';
import { Segmented, AspectIcon } from '@/components/ui/Segmented';
import { ModelPicker } from '@/components/ui/ModelPicker';
import { PresetGrid } from '@/components/ui/PresetGrid';
import { CostBadge } from '@/components/ui/CostBadge';
import { JobCard } from '@/components/ui/JobCard';
import { VideoTile } from '@/components/ui/VideoTile';
import { VideoModal, type VideoDetail } from '@/components/ui/VideoModal';
import { LedgerTable } from '@/components/ui/LedgerTable';
import { PlanCard } from '@/components/ui/PlanCard';
import { Toaster, useToasts } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { MODELS, PRESETS, POSTERS } from '@/lib/samples';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="flex flex-col gap-4 border-t border-border py-8"><h2 className="text-lg font-semibold">{title}</h2>{children}</section>;
}
export default function DesignPage() {
  const [prompt, setPrompt] = useState('Un faro en un acantilado al atardecer');
  const [aspect, setAspect] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [dur, setDur] = useState<'5' | '10'>('5');
  const [model, setModel] = useState('cine'); const [preset, setPreset] = useState('dolly-in');
  const [img, setImg] = useState<string>(); const [imgErr, setImgErr] = useState<string>();
  const [fav, setFav] = useState<Record<number, boolean>>({ 1: true });
  const [open, setOpen] = useState<VideoDetail | null>(null);
  const push = useToasts((s) => s.push);
  const cost = (MODELS.find((m) => m.id === model)?.fromCredits ?? 0) * (dur === '10' ? 2 : 1);
  return (
    <main className="mx-auto max-w-content px-4 py-8">
      <h1 className="text-xl font-bold">Sistema de diseño</h1>
      <p className="text-text-muted">Primitivas de videoia con todos sus estados. Colores desde <code>replica/design/tokens.json</code>.</p>

      <Section title="Botones">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primario</Button><Button variant="secondary">Secundario</Button><Button variant="ghost">Fantasma</Button><Button variant="danger">Eliminar</Button>
          <Button disabled>Desactivado</Button><Button loading>Generando</Button><Button size="sm">Pequeño</Button><Button size="lg"><Wand2 size={18} aria-hidden />Generar</Button>
        </div>
      </Section>

      <Section title="Crear: descripción, imagen, formato">
        <div className="grid gap-6 md:grid-cols-2">
          <PromptBox value={prompt} onChange={setPrompt} onSubmit={() => push('info', 'Ctrl+Enter genera')} />
          <PromptBox value={'x'.repeat(1850)} onChange={() => {}} label="Cerca del límite" />
          <PromptBox value="foto de una persona famosa" onChange={() => {}} label="Bloqueado por moderación" error="No generamos vídeos de personas reales identificables." />
          <div className="flex flex-wrap gap-4">
            <ImageDropzone preview={img} aspect={aspect.replace(':', ' / ')} onFile={(f) => { const e = checkImage(f); setImgErr(e ?? undefined); if (!e) setImg(URL.createObjectURL(f)); }} onClear={() => setImg(undefined)} error={imgErr} />
            <ImageDropzone onFile={() => {}} onClear={() => {}} error="La imagen pesa más de 20 MB." />
          </div>
          <div className="flex flex-wrap gap-6">
            <Segmented legend="Formato" value={aspect} onChange={setAspect} options={(['9:16', '16:9', '1:1'] as const).map((a) => ({ value: a, label: a, icon: <AspectIcon aspect={a} /> }))} />
            <Segmented legend="Duración" value={dur} onChange={setDur} options={[{ value: '5', label: '5 s' }, { value: '10', label: '10 s' }]} />
          </div>
        </div>
      </Section>

      <Section title="Modelo y movimiento">
        <ModelPicker models={MODELS} value={model} onChange={setModel} />
        <PresetGrid presets={PRESETS} value={preset} onChange={setPreset} />
      </Section>

      <Section title="Coste y generar">
        <CostBadge cost={cost} balance={188} />
        <CostBadge cost={30} balance={32} />
        <CostBadge cost={30} balance={12} />
        <div className="flex flex-wrap items-center gap-3"><Button size="lg" onClick={() => push('success', 'Generación en cola')}><Wand2 size={18} aria-hidden />Generar · {cost} créditos</Button>
          <Button size="lg" disabled aria-describedby="why"><Wand2 size={18} aria-hidden />Generar</Button><span id="why" className="text-sm text-text-muted">Escribe una descripción o sube una imagen.</span></div>
      </Section>

      <Section title="Trabajos en curso">
        <div className="grid gap-2 md:grid-cols-2">
          <JobCard prompt="Un faro en un acantilado" model="Cine" preset="Acercamiento" status="queued" onCancel={() => push('info', 'Cancelado. Créditos devueltos.')} poster={POSTERS[0]} />
          <JobCard prompt="Ciudad de neón bajo la lluvia" model="Pro" preset="Dron" status="running" startedAt={Date.now() - 74000} poster={POSTERS[1]} />
          <JobCard prompt="Bosque con niebla" model="Rápido" status="failed" refunded={4} onRetry={() => push('error', 'El proveedor no responde. Prueba en unos minutos.')} poster={POSTERS[2]} />
          <JobCard prompt="Plato de pasta humeante" model="Cine" status="cancelled" poster={POSTERS[3]} />
        </div>
      </Section>

      <Section title="Galería">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(var(--tile-min), 45%), 1fr))' }}>
          {POSTERS.map((p, i) => <VideoTile key={i} prompt={`Vídeo de ejemplo ${i + 1}`} poster={p} duration={i % 2 ? 10 : 5} favourite={fav[i]} onToggleFavourite={() => setFav((f) => ({ ...f, [i]: !f[i] }))}
            onOpen={() => setOpen({ id: String(i), prompt: `Vídeo de ejemplo ${i + 1}`, model: 'Cine', preset: 'Órbita', aspect: '9:16', duration: 5, seed: 4821 + i, cost: 12, poster: p })} />)}
        </div>
        <EmptyState icon={<Film size={32} />} title="Aún no has creado ningún vídeo" help="Escribe una frase o sube una imagen y elige un movimiento de cámara." action={<Button><Plus size={16} aria-hidden />Crear el primero</Button>} />
      </Section>

      <Section title="Créditos">
        <LedgerTable rows={[
          { id: '1', at: '2026-11-17T09:12:00Z', reason: 'refund', delta: 4, balanceAfter: 188, note: 'Bosque con niebla' },
          { id: '2', at: '2026-11-17T09:10:00Z', reason: 'generation', delta: -4, balanceAfter: 184, note: 'Bosque con niebla' },
          { id: '3', at: '2026-11-16T18:00:00Z', reason: 'generation', delta: -12, balanceAfter: 188, note: 'Un faro en un acantilado' },
          { id: '4', at: '2026-11-01T00:00:00Z', reason: 'plan_grant', delta: 200, balanceAfter: 200 },
        ]} />
        <LedgerTable rows={[]} />
        <LedgerTable rows={[]} loading />
      </Section>

      <Section title="Planes">
        <div className="grid gap-4 pt-3 md:grid-cols-3">
          <PlanCard plan={{ id: 'basic', name: 'Básico', priceEur: 9, credits: 200, videosApprox: 16, features: ['Todos los modelos', 'Descarga sin marca de agua', 'Créditos devueltos si falla'] }} current onChoose={() => {}} />
          <PlanCard plan={{ id: 'creator', name: 'Creador', priceEur: 24, credits: 600, videosApprox: 50, features: ['Todo lo de Básico', '3 vídeos a la vez', 'Los créditos no usados pasan al mes siguiente'], recommended: true }} onChoose={() => {}} />
          <PlanCard plan={{ id: 'studio', name: 'Estudio', priceEur: 59, credits: 1600, videosApprox: 133, features: ['Todo lo de Creador', '5 vídeos a la vez', 'Resolución mejorada'] }} onChoose={() => {}} />
        </div>
      </Section>

      <Section title="Avisos">
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => push('info', 'Tu vídeo está en cola.')}>Info</Button><Button variant="secondary" onClick={() => push('success', 'Vídeo listo.')}>Éxito</Button><Button variant="secondary" onClick={() => push('error', 'No se ha podido generar. Créditos devueltos.')}>Error</Button></div>
      </Section>
      <VideoModal video={open} onClose={() => setOpen(null)} onRegenerate={() => push('success', 'Regenerando con otra semilla')} onCopySettings={() => push('info', 'Ajustes copiados')} onDelete={() => { setOpen(null); push('success', 'Vídeo eliminado'); }} />
      <Toaster />
    </main>
  );
}
