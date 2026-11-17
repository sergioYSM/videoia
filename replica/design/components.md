# Components: videoia

Tokens: `replica/design/tokens.json` → `app/tokens.css` + `tailwind.tokens.cjs`
(`npm run tokens`). Components use roles only (`bg-surface text-text-muted`),
never hex. Icons: Lucide (ISC). Font: Inter (OFL). All copy written fresh, in
Spanish.

Rules for every component: real HTML element for the job (button, input,
radio, dialog), `:focus-visible` ring 2px `focus`, hit area ≥ 40px on touch,
`prefers-reduced-motion` stops autoplay and transitions.

Primitives are built in `components/ui/` and shown together on `/design`.

---

```
Button
  variants  primary (accent), secondary (surface-raised), ghost, danger
  sizes     sm 32px, md 40px, lg 48px (Generate)
  states    default, hover, active, focus-visible, disabled, loading (spinner + label kept)
  tokens    primary: bg accent, text on-accent; radius md; font sm/600
  a11y      <button>; loading sets aria-busy and keeps the label; disabled with a reason
            shows it as visible text next to the button, not only a tooltip
  used on   all
```

```
PromptBox
  parts     textarea (auto-grow 3–8 rows), character counter "123 / 2000", clear button
  states    empty (placeholder), typing, near limit (counter warning at 90%), over limit
            (counter danger, Generate disabled), blocked by moderation (error text below, danger)
  tokens    bg surface-raised, border border-input, radius lg, text base
  a11y      <label> visible ("Describe el vídeo"), counter in aria-describedby and announced
            politely only at 90% and 100%; Ctrl/Cmd+Enter = Generate
  used on   S03
```

```
ImageDropzone
  parts     drop area, "Elegir imagen" button, preview with remove button, aspect hint
  states    empty, drag-over (border accent, bg surface-hover), uploading (progress bar),
            filled (preview cropped to the chosen aspect), error (wrong type / > 20 MB / blocked)
  tokens    dashed border border-input, radius lg; error text danger
  a11y      the button is the real control (<input type=file> visually hidden, label);
            drop is an extra, never the only way; errors in role=alert
  used on   S03
```

```
ModelPicker (radio cards)
  parts     card: name, one-line strength, speed and quality chips, cost "desde 6 créditos"
  states    default, hover, checked (shadow glow, check icon), focus-visible, disabled
            ("no admite 1:1" etc. as visible text)
  tokens    bg surface-raised, checked border accent; cost text text-muted
  a11y      <fieldset> + <legend>, native radios; arrows move between cards
  used on   S03
```

```
MotionPresetCard (radio cards in a grid, with categories)
  parts     looping preview (muted <video>, poster), name, category tag
  states    default (poster only), hover/focus (preview plays), checked (glow + check),
            loading preview (skeleton)
  tokens    radius md; name sm/600 on a bottom gradient scrim
  a11y      native radios in a <fieldset>; preview video aria-hidden; reduced motion =
            poster only; search box above filters the list (label "Buscar movimiento")
  used on   S03, S04
```

```
Segmented (aspect 9:16 / 16:9 / 1:1, duration 5 / 10 s)
  states    default, hover, checked, focus-visible, disabled option
  tokens    track bg surface, checked bg surface-active + text, radius pill
  a11y      radio group (<fieldset>, native radios); aspect options show a small shape icon
            plus the text
  used on   S03
```

```
CostBadge
  shows     "Cuesta 12 créditos · te quedan 188"
  states    enough (text-muted), after this < 10% (warning), not enough (danger + "Comprar
            créditos" link)
  a11y      aria-live=polite, updates when model/duration changes
  used on   S03
```

```
JobCard (generation in progress)
  parts     thumbnail or input image, prompt (1 line), model + preset, status, progress, cancel
  states    queued ("En cola"), running (indeterminate bar + elapsed time), succeeded (becomes
            a VideoTile), failed (danger text + "Créditos devueltos" success chip + Retry),
            cancelled
  tokens    bg surface-raised, radius lg
  a11y      status text in a role=status region; progress is <progress> (no fake %)
  used on   S03, S05, S06
```

```
VideoTile
  parts     poster, duration chip, favourite toggle, hover-play muted preview
  states    default, hover/focus (plays), favourite on, failed (no poster: icon + text)
  tokens    radius md, chips bg scrim/70 text text
  a11y      the tile is a <button> that opens the detail ("Ver vídeo: {prompt}"); favourite is
            a separate toggle with aria-pressed; reduced motion = no autoplay
  used on   S01, S06
```

```
VideoModal (detail / player)
  parts     <video controls>, settings summary (prompt, model, preset, aspect, duration, seed,
            cost), actions: Descargar, Regenerar, Copiar ajustes, Abrir en editor, Eliminar
  states    loading, ready, deleting (confirm inside the modal)
  tokens    scrim at 80%, panel bg surface, radius xl
  a11y      <dialog> with showModal(): focus trapped and restored, Esc closes, title = prompt
  used on   S07
```

```
LedgerTable
  columns   fecha, concepto (Compra, Plan mensual, Vídeo, Devolución), créditos (+/-), saldo
  states    empty, loading (skeleton rows), filled; refunds in success, charges in text
  a11y      real <table> with <caption>; numbers tabular, signed, not colour only
  used on   S10
```

```
PlanCard
  parts     name, price/month, credits/month, ≈ number of videos, features, CTA
  states    default, recommended (border accent + "Recomendado"), current plan (CTA disabled
            "Tu plan")
  toggle    monthly / annual is a Segmented
  a11y      heading per plan; price read as text ("12 euros al mes")
  used on   S09, S11
```

```
Toast
  variants  info, success, error
  states    enter, visible 5 s (paused on hover/focus), dismiss
  a11y      role=status (error: role=alert); never the only place an error is shown
  used on   all
```

```
EmptyState
  parts     icon, one-line title, one-line help, one action
  used on   S06 (no videos yet), S10 (no movements)
```

```
AppShell
  layout    sidebar 232px (Crear, Galería, Créditos, Planes) + topbar 56px with credit
            balance pill; < 768px the sidebar becomes a bottom tab bar
  a11y      <nav aria-label="Principal">, current page aria-current, skip link
```
