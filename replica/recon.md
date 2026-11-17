# Recon map: Higgsfield (web, AI video generation)

Scope (proposed): the core loop of the web app: from an image or a text prompt,
pick a camera motion and a model, generate a short video, keep it in a gallery,
download or send it to an editor. Credits and plans. Not: training custom
character/face models (Soul ID), face swap, lip-sync of real people, the
"apps" marketplace of effects, team workspaces.
For: a product to sell to the same creators as Clipsong and Ownframe; generated
clips open in Ownframe for editing.
Date: 2026-11-17

## Recon limits (read this first)
- higgsfield.ai was not opened from this environment. The map comes from public
  reviews and articles found by search (below). Screens marked `(verify)` need a
  look in the user's own browser.
- No account used; no code, bundles or network calls of the original read.
- Several "complaints" pages found are published on the original's own domain
  (geo.higgsfield.ai): treated as promotional, not as user evidence.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Luma Labs: Higgsfield review | https://lumalabs.ai/news/higgsfield-review | competitor-written |
| 2 | Luma Labs: Higgsfield pricing | https://lumalabs.ai/news/higgsfield-pricing | competitor-written |
| 3 | Creatify: review 2026 | https://creatify.ai/blog/higgsfield-ai-review-(2026)-is-it-worth-it | competitor-written |
| 4 | Creatify: pricing 2026 | https://creatify.ai/blog/higgsfield-pricing-(2026)-plans-and-what-you-ll-actually-pay | plans, credits |
| 5 | Segmind: free plan and pricing guide | https://blog.segmind.com/higgsfield-ai-features-pricing-guide/ | features |
| 6 | fluxnote: review 2026 | https://fluxnote.io/guides/higgsfield-ai-review | features, fit |
| 7 | aifunnelinsider: "The Credit Trap" | https://aifunnelinsider.com/higgsfield-ai-review-2026/ | credits critique |
| 8 | Trustpilot (UK) | https://uk.trustpilot.com/review/higgsfield.ai?page=4 | billing/refund complaints (via aggregators) |
| 9 | imagine.art: pricing 2026 | https://www.imagine.art/blogs/higgsfield-ai-pricing | credits, rollover |
| 10 | G2 pricing | https://www.g2.com/products/higgsfield/pricing | plans |
| 11 | eMarketer | https://www.emarketer.com/content/low-cost--high-impact--image-video-generator-that-marketers-can-t-ignore | market context |

## Core loop
Pick a starting point (your image or a prompt) → choose a camera move (dolly,
crane, orbit, crash zoom…) and a model → generate (wait ~1-5 min) → watch,
regenerate or keep → download / use. Users pay in credits; credits differ per
model and length.

## Screens

| ID | screen | route / how | purpose | key components | states |
| --- | --- | --- | --- | --- | --- |
| S01 | Landing / explore | / | examples feed, models, CTA | video grid (autoplay muted), filters | loading |
| S02 | Sign up / log in | /login | account | OAuth, email | error |
| S03 | Create video | /create | prompt, image upload, model, motion preset, aspect, duration, cost preview, Generate | prompt box, dropzone, model picker, preset grid with previews, segmented controls, credit cost | empty, invalid image, not enough credits |
| S04 | Motion preset library | panel in S03 (verify) | browse 70+ camera moves with example clips | preset cards (hover-play), categories, search | - |
| S05 | Generation queue / progress | in S03 / S06 | jobs running | job card (thumb, % or spinner, ETA), cancel | queued, running, failed, done |
| S06 | Gallery / history | /library (verify) | all generations | grid, filters (model, status), favourites | empty, filled, failed items |
| S07 | Video detail | modal from S06 | watch, download, regenerate with same settings, upscale (verify), delete, share | player, settings summary, actions | - |
| S08 | Create image (Soul) | /image (verify) | text-to-image as a starting frame | prompt, style presets, aspect | - |
| S09 | Pricing / plans | /pricing | plans, credits, annual/monthly | plan cards, toggle | - |
| S10 | Account / billing / credits | /account | balance, history, cancel | ledger table, buttons | low balance |
| S11 | Upsell / not enough credits | modal | buy credits / upgrade | modal | - |

## Flows

```
F01 Image to video with a camera move (core)
    S03 upload image -> pick preset -> pick model -> see cost -> Generate -> S05 progress -> S07 watch -> download
    happy path clicks: ~6
    edge: image too big/wrong format, NSFW/policy rejection by the model, provider timeout, not enough credits, user closes tab

F02 Text to video
    S03 prompt -> model -> aspect/duration -> cost -> Generate -> S05 -> S07

F03 Text to image, then animate
    S08 prompt -> image -> "animate" -> F01

F04 Regenerate / variations
    S07 regenerate (same settings, new seed) -> S05

F05 Buy credits / subscribe / cancel
    S11 or S09 -> checkout -> balance updated; S10 cancel

F06 Failed generation
    S05 failed -> credits returned? (complaint area) -> retry

F07 Send to editor (ours)
    S07 "Editar en Ownframe" -> clip imported in a new or existing Ownframe project
```

## Components
Prompt box (counter, enhance button), image dropzone (crop to aspect), model picker
(card with name, speed, quality, credit cost), motion preset card (looping preview on
hover/focus), segmented controls (aspect 9:16/16:9/1:1, duration 5/10 s), cost badge
("cuesta 6 créditos · te quedan 194"), Generate button (disabled with reason), job card
(states), video tile (hover play), player modal, credit ledger table, plan cards, toasts.

## Inferred data model

```
User           id, email, name, plan, created_at                       confidence: high
CreditLedger   id, user_id, delta (+/-), reason (plan_grant|purchase|generation|refund|expiry),
               generation_id?, balance_after, created_at              evidence: S10, complaints about burn/refunds  confidence: medium
Generation     id, user_id, kind (video|image), status (queued|running|succeeded|failed|cancelled),
               prompt, input_image_id?, model, motion_preset?, aspect, duration_s, seed,
               provider, provider_job_id, cost_credits, output_url, thumb_url, error, created_at, finished_at
               evidence: S03 settings, S05 states, S07 "regenerate"   confidence: high (fields partly guessed)
Upload         id, user_id, kind (image), url, width, height, created_at    confidence: high
MotionPreset   id, name, category, prompt_template / provider parameters, preview_url   confidence: medium (guess on internals)
ModelInfo      id, provider, name, max_duration, aspects, cost per second/clip   confidence: high
Subscription   user_id, plan, interval, status, period_end, provider_ref       confidence: high
```

## Feature matrix
See `features.csv`. Must: 14, should: 12, could: 7, skip: 6.

## Out of scope (cannot or should not be cloned)
- **The models.** Higgsfield's own models and its deals with model makers. The clone
  calls public model APIs (e.g. through fal.ai or the makers' own APIs) with the
  user's keys; quality and prices are theirs.
- **Face swap, character models from a real person's face (Soul ID-style), lip-sync of real
  people**: consent and impersonation risk; not built. (A future version could allow it
  only for the account owner's own face with verified consent.)
- The effects/"apps" marketplace and its creators; the community feed of other people's content.
- Its brand, preset names and example videos.

## Size
Screens 11, flows 7, entities 7. Hard parts:
1. **Generation pipeline**: async jobs with providers (submit, poll or webhook, timeouts,
   retries), storing outputs before provider URLs expire, per-model parameters.
2. **Credits ledger**: atomic charge on submit, automatic refund on failure, no double
   charge on retries, plan grants, expiry rules: money logic, must be exact.
3. **Costs and abuse**: every generation costs real money; rate limits, caps, safety filters
   (provider moderation + our own prompt/image checks), no generation of real people's likeness.
4. Camera presets that actually work across models (each model takes motion differently).

Size: **L**. A usable vertical slice (one provider, image/text→video, 10 presets, gallery,
credits with refunds) is **M**.
